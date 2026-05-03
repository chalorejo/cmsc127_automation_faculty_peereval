import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Nomination, NominationStatus } from './entities/nomination.entity';
import { SubmitNominationsDto } from './dto/submit-nominations.dto';
import { EvaluationCycle } from '../evaluation-cycles/entities/evaluation-cycle.entity';
import { EvaluationCycleFaculty } from '../evaluation-cycles/entities/evaluation-cycle-faculty.entity';
import { MagicLink, MagicLinkPurpose } from '../magic-links/entities/magic-link.entity';
import { ReviewNominationItemDto } from './dto/review-nominations.dto';
import { Evaluation, EvaluationStatus } from '../evaluations/entities/evaluation.entity';
import { EmailService } from '../email/email.service';
import { MagicLinksService } from '../magic-links/magic-links.service';

@Injectable()
export class NominationsService {
  private readonly logger = new Logger(NominationsService.name);
  private readonly minimumApprovedEvaluators = 3;

  constructor(
    @InjectRepository(Nomination) private nomRepo: Repository<Nomination>,
    private dataSource: DataSource, // Used for Transactions
    private emailService: EmailService,
    private magicLinksService: MagicLinksService,
    private configService: ConfigService,
  ) {}

  async findPendingApprovalGrouped() {
    const pending = await this.nomRepo.find({
      where: { status: NominationStatus.PENDING },
      relations: ['evaluatee', 'evaluator', 'cycle'],
      order: {
        evaluatee_id: 'ASC',
        nomination_id: 'ASC',
      },
    });

    const grouped = pending.reduce((acc, nomination) => {
      const key = nomination.evaluatee_id;

      if (!acc[key]) {
        acc[key] = {
          evaluatee_id: nomination.evaluatee_id,
          evaluatee_name: nomination.evaluatee?.full_name,
          evaluatee_email: nomination.evaluatee?.email,
          nominations: [],
        };
      }

      acc[key].nominations.push(nomination);
      return acc;
    }, {} as Record<number, { evaluatee_id: number; evaluatee_name?: string; evaluatee_email?: string; nominations: Nomination[] }>);

    return Object.values(grouped);
  }

  async submitNominations(evaluateeId: number, dto: SubmitNominationsDto, tokenId?: number) {
    if (dto.evaluator_ids.includes(evaluateeId)) {
      throw new BadRequestException("You cannot nominate yourself.");
    }

    const uniqueEvaluatorIds = new Set(dto.evaluator_ids);
    if (uniqueEvaluatorIds.size !== dto.evaluator_ids.length) {
      throw new BadRequestException('Duplicate evaluator IDs are not allowed.');
    }

    // 1. Find the active cycle
    const cycle = await this.dataSource.getRepository(EvaluationCycle).findOne({ where: { is_active: true } });
    if (!cycle) throw new BadRequestException("No active evaluation cycle found.");

    const assignmentRepo = this.dataSource.getRepository(EvaluationCycleFaculty);
    const evaluateeAssignment = await assignmentRepo.findOne({
      where: { cycle_id: cycle.cycle_id, user_id: evaluateeId },
    });

    if (!evaluateeAssignment) {
      throw new BadRequestException('You are not assigned to the active evaluation cycle.');
    }

    const evaluatorAssignments = await assignmentRepo.find({
      where: { cycle_id: cycle.cycle_id, user_id: In([...uniqueEvaluatorIds]) },
    });

    if (evaluatorAssignments.length !== uniqueEvaluatorIds.size) {
      const assignedIds = new Set(evaluatorAssignments.map((assignment) => assignment.user_id));
      const missingIds = [...uniqueEvaluatorIds].filter((id) => !assignedIds.has(id));
      throw new BadRequestException(
        `The following evaluators are not assigned to the active cycle: ${missingIds.join(', ')}`,
      );
    }

    // 2. Use a Transaction to ensure all 5 save, or none save
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingNominations = await queryRunner.manager.count(Nomination, {
        where: { evaluatee_id: evaluateeId, cycle_id: cycle.cycle_id },
      });

      if (existingNominations > 0) {
        throw new BadRequestException('Nominations have already been submitted for this cycle.');
      }

      // Create the Nomination entities
      const nominations = dto.evaluator_ids.map(evaluator_id => {
        return this.nomRepo.create({
          evaluatee_id: evaluateeId,
          evaluator_id: evaluator_id,
          cycle_id: cycle.cycle_id,
          status: NominationStatus.PENDING,
        });
      });

      await queryRunner.manager.save(nominations);

      if (tokenId) {
        const token = await queryRunner.manager.findOne(MagicLink, {
          where: {
            token_id: tokenId,
            user_id: evaluateeId,
            purpose: MagicLinkPurpose.NOMINATION,
            is_used: false,
          },
        });

        if (!token || token.expires_at <= new Date()) {
          throw new BadRequestException('Invalid, expired, or already used nomination magic link.');
        }

        await queryRunner.manager.update(MagicLink, tokenId, { is_used: true });
      }

      await queryRunner.commitTransaction();
      return { message: 'Nominations submitted successfully' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async reviewNominations(reviewerId: number, decisions: ReviewNominationItemDto[]) {
    if (decisions.length === 0) {
      throw new BadRequestException('At least one nomination decision is required.');
    }

    const allowedStatuses = [NominationStatus.APPROVED, NominationStatus.REJECTED];
    const hasInvalidStatus = decisions.some(
      (decision) => !allowedStatuses.includes(decision.status),
    );

    if (hasInvalidStatus) {
      throw new BadRequestException('Review status must be APPROVED or REJECTED.');
    }

    const nominationIds = decisions.map((d) => d.nomination_id);
    const nominations = await this.nomRepo.find({
      where: {
        nomination_id: In(nominationIds),
        status: NominationStatus.PENDING,
      },
      relations: ['cycle'],
    });

    if (nominations.length !== nominationIds.length) {
      throw new BadRequestException('One or more nominations are missing or already reviewed.');
    }

    const statusByNominationId = new Map(
      decisions.map((d) => [d.nomination_id, d.status]),
    );

    const nominationsByEvaluatee = new Map<string, { evaluatee_id: number; cycle_id: number; nomination_ids: number[] }>();
    for (const nomination of nominations) {
      const key = `${nomination.evaluatee_id}:${nomination.cycle_id}`;
      if (!nominationsByEvaluatee.has(key)) {
        nominationsByEvaluatee.set(key, {
          evaluatee_id: nomination.evaluatee_id,
          cycle_id: nomination.cycle_id,
          nomination_ids: [],
        });
      }
      nominationsByEvaluatee.get(key)!.nomination_ids.push(nomination.nomination_id);
    }

    for (const group of nominationsByEvaluatee.values()) {
      const approvedCount = group.nomination_ids.filter(
        (id) => statusByNominationId.get(id) === NominationStatus.APPROVED,
      ).length;

      if (approvedCount !== this.minimumApprovedEvaluators) {
        throw new BadRequestException(
          `Exactly ${this.minimumApprovedEvaluators} evaluators must be approved for evaluatee #${group.evaluatee_id} in cycle #${group.cycle_id}.`,
        );
      }

      const totalPending = await this.nomRepo.count({
        where: {
          evaluatee_id: group.evaluatee_id,
          cycle_id: group.cycle_id,
          status: NominationStatus.PENDING,
        },
      });

      if (totalPending !== group.nomination_ids.length) {
        throw new BadRequestException(
          `All pending nominations for evaluatee #${group.evaluatee_id} in cycle #${group.cycle_id} must be reviewed together.`,
        );
      }
    }

    const approvedNominationIds = decisions
      .filter((d) => d.status === NominationStatus.APPROVED)
      .map((d) => d.nomination_id);

    const approvedNominations = nominations.filter((nomination) =>
      approvedNominationIds.includes(nomination.nomination_id),
    );

    const cycleIds = [...new Set(approvedNominations.map((nomination) => nomination.cycle_id))];
    const cycles = await this.dataSource.getRepository(EvaluationCycle).find({
      where: { cycle_id: In(cycleIds) },
    });
    const cycleById = new Map(cycles.map((cycle) => [cycle.cycle_id, cycle]));

    const workloadCounts = new Map<string, number>();
    const evaluationRows = await this.dataSource
      .getRepository(Evaluation)
      .createQueryBuilder('evaluation')
      .innerJoin('evaluation.nomination', 'nomination')
      .select('nomination.cycle_id', 'cycle_id')
      .addSelect('nomination.evaluator_id', 'evaluator_id')
      .addSelect('COUNT(evaluation.evaluation_id)', 'evaluation_count')
      .where('nomination.cycle_id IN (:...cycleIds)', { cycleIds })
      .groupBy('nomination.cycle_id')
      .addGroupBy('nomination.evaluator_id')
      .getRawMany<{ cycle_id: string; evaluator_id: string; evaluation_count: string }>();

    for (const row of evaluationRows) {
      workloadCounts.set(`${row.cycle_id}:${row.evaluator_id}`, Number(row.evaluation_count));
    }

    for (const nomination of approvedNominations) {
      const cycle = cycleById.get(nomination.cycle_id);

      if (!cycle) {
        throw new BadRequestException(`Evaluation cycle #${nomination.cycle_id} not found.`);
      }

      const workloadKey = `${nomination.cycle_id}:${nomination.evaluator_id}`;
      const currentCount = workloadCounts.get(workloadKey) ?? 0;

      if (currentCount >= cycle.max_evaluations_per_faculty) {
        throw new BadRequestException(
          `Evaluator #${nomination.evaluator_id} has already reached the maximum of ${cycle.max_evaluations_per_faculty} evaluation assignments for cycle ${cycle.year}.`,
        );
      }

      workloadCounts.set(workloadKey, currentCount + 1);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const nominationsToSave = nominations.map((nomination) => {
        nomination.status = statusByNominationId.get(nomination.nomination_id) as NominationStatus;
        nomination.approved_by = reviewerId;
        return nomination;
      });

      await queryRunner.manager.save(Nomination, nominationsToSave);

      if (approvedNominationIds.length > 0) {
        const existingEvaluations = await queryRunner.manager.find(Evaluation, {
          where: { nomination_id: In(approvedNominationIds) },
          select: ['nomination_id'],
        });

        const existingNominationIds = new Set(
          existingEvaluations.map((evaluation) => evaluation.nomination_id),
        );

        const evaluationsToCreate = approvedNominationIds
          .filter((nominationId) => !existingNominationIds.has(nominationId))
          .map((nominationId) =>
            queryRunner.manager.create(Evaluation, {
              nomination_id: nominationId,
              status: EvaluationStatus.PENDING,
            }),
          );

        if (evaluationsToCreate.length > 0) {
          await queryRunner.manager.save(Evaluation, evaluationsToCreate);
        }
      }

      await queryRunner.commitTransaction();

      this.logger.log(
        `Nomination review completed by user #${reviewerId}. Approved: ${approvedNominationIds.length}, Total reviewed: ${decisions.length}.`,
      );

      // Send evaluation emails to approved evaluators
      const emailResult = await this.sendEvaluationEmails(approvedNominationIds);

      return {
        message: 'Nominations reviewed successfully.',
        reviewed_count: decisions.length,
        approved_count: approvedNominationIds.length,
        evaluation_emails_sent: emailResult.success,
        evaluation_emails_failed: emailResult.failed,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async sendEvaluationEmails(nominationIds: number[]) {
    const sentCount = { success: 0, failed: 0 };
    const failedEvaluators: Array<{ evaluator_id: number; email: string; error: string }> = [];

    if (nominationIds.length === 0) {
      return sentCount;
    }

    try {
      // Get evaluations with evaluator and evaluatee details
      const evaluations = await this.dataSource.getRepository(Evaluation).find({
        where: { nomination_id: In(nominationIds) },
        relations: [
          'nomination',
          'nomination.evaluator',
          'nomination.evaluatee',
          'nomination.cycle',
        ],
      });

      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      if (!frontendUrl) {
        throw new Error('FRONTEND_URL must be set to send evaluation emails.');
      }

      // Send email to each evaluator
      for (const evaluation of evaluations) {
        try {
          const evaluator = evaluation.nomination.evaluator;
          const evaluatee = evaluation.nomination.evaluatee;
          const cycle = evaluation.nomination.cycle;

          // Create magic link for evaluation
          const magicLink = await this.magicLinksService.createLink({
            user_id: evaluator.user_id,
            purpose: MagicLinkPurpose.EVALUATION,
            reference_id: evaluation.evaluation_id,
          });

          // Build magic link URL
          const magicLinkUrl = `${frontendUrl}/evaluate?token=${magicLink.token_hash}`;

          // Send email
          await this.emailService.sendEvaluationMagicLinkEmail(
            evaluator.email,
            evaluator.full_name,
            evaluatee.full_name,
            magicLinkUrl,
            `Year ${cycle.year}`,
          );

          sentCount.success++;
          this.logger.log(
            `Evaluation email sent to evaluator #${evaluator.user_id} (${evaluator.email}) for evaluation of #${evaluatee.user_id}.`,
          );
        } catch (error) {
          sentCount.failed++;
          failedEvaluators.push({
            evaluator_id: evaluation.nomination.evaluator_id,
            email: evaluation.nomination.evaluator.email,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          this.logger.error(
            `Failed to send evaluation email to evaluator #${evaluation.nomination.evaluator_id} (${evaluation.nomination.evaluator.email}): ${error}`,
          );
        }
      }

      if (sentCount.failed > 0) {
        this.logger.warn(
          `Evaluation email sending completed with ${sentCount.success} successes and ${sentCount.failed} failures.`,
        );
      }
    } catch (error) {
      this.logger.error(`Error in sendEvaluationEmails: ${error}`);
      // Log but don't throw - email failure shouldn't fail the review process
    }

    return sentCount;
  }
}