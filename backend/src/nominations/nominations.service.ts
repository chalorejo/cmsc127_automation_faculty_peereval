import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Nomination, NominationStatus } from './entities/nomination.entity';
import { SubmitNominationsDto } from './dto/submit-nominations.dto';
import { EvaluationCycle } from '../evaluation-cycles/entities/evaluation-cycle.entity';
import { MagicLink, MagicLinkPurpose } from '../magic-links/entities/magic-link.entity';
import { ReviewNominationItemDto } from './dto/review-nominations.dto';
import { Evaluation, EvaluationStatus } from '../evaluations/entities/evaluation.entity';

@Injectable()
export class NominationsService {
  private readonly logger = new Logger(NominationsService.name);

  constructor(
    @InjectRepository(Nomination) private nomRepo: Repository<Nomination>,
    private dataSource: DataSource, // Used for Transactions
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

    // 1. Find the active cycle
    const cycle = await this.dataSource.getRepository(EvaluationCycle).findOne({ where: { is_active: true } });
    if (!cycle) throw new BadRequestException("No active evaluation cycle found.");

    // 2. Use a Transaction to ensure all 5 save, or none save
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create the Nomination entities
      const nominations = dto.evaluator_ids.map(evaluator_id => {
        return this.nomRepo.create({
          evaluatee_id: evaluateeId,
          evaluator_id: evaluator_id,
          cycle_id: cycle.cycle_id,
          status: 'PENDING' as any, // Using the enum value
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
    });

    if (nominations.length !== nominationIds.length) {
      throw new BadRequestException('One or more nominations are missing or already reviewed.');
    }

    const statusByNominationId = new Map(
      decisions.map((d) => [d.nomination_id, d.status]),
    );

    const approvedNominationIds = decisions
      .filter((d) => d.status === NominationStatus.APPROVED)
      .map((d) => d.nomination_id);

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

      // Placeholder for notification integration once mailer service is connected.
      return {
        message: 'Nominations reviewed successfully.',
        reviewed_count: decisions.length,
        approved_count: approvedNominationIds.length,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}