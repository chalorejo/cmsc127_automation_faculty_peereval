import { Injectable, ConflictException, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EvaluationCycle } from './entities/evaluation-cycle.entity';
import { EvaluationCycleFaculty } from './entities/evaluation-cycle-faculty.entity';
import { CreateEvaluationCycleDto } from './dto/create-evaluation-cycle.dto';
import { UpdateEvaluationCycleDto } from './dto/update-evaluation-cycle.dto';
import { AssignFacultyToCycleDto } from './dto/assign-faculty-to-cycle.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { EmailService } from '../email/email.service';
import { MagicLinksService } from '../magic-links/magic-links.service';
import { MagicLinkPurpose } from '../magic-links/entities/magic-link.entity';

@Injectable()
export class EvaluationCyclesService {
  private readonly logger = new Logger(EvaluationCyclesService.name);

  constructor(
    @InjectRepository(EvaluationCycle)
    private readonly cycleRepo: Repository<EvaluationCycle>,
    @InjectRepository(EvaluationCycleFaculty)
    private readonly cycleFacultyRepo: Repository<EvaluationCycleFaculty>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly emailService: EmailService,
    private readonly magicLinksService: MagicLinksService,
    private readonly configService: ConfigService,
  ) {}

  async create(createDto: CreateEvaluationCycleDto) {
    // Check if the year already exists to prevent duplicates
    const existing = await this.cycleRepo.findOne({ where: { year: createDto.year } });
    if (existing) {
      throw new ConflictException(`Evaluation cycle for year ${createDto.year} already exists.`);
    }

    const willBeActive = createDto.is_active ?? true;
    if (willBeActive) {
      const activeCycle = await this.cycleRepo.findOne({ where: { is_active: true } });
      if (activeCycle) {
        throw new ConflictException(
          `Cannot create a new active cycle while cycle #${activeCycle.cycle_id} is still active. Close the current cycle first.`,
        );
      }
    }

    const cycle = this.cycleRepo.create(createDto);
    return this.cycleRepo.save(cycle);
  }

  async update(cycleId: number, updateDto: UpdateEvaluationCycleDto) {
    const cycle = await this.cycleRepo.findOne({ where: { cycle_id: cycleId } });

    if (!cycle) {
      throw new NotFoundException(`Evaluation cycle #${cycleId} not found.`);
    }

    if (updateDto.year && updateDto.year !== cycle.year) {
      const existing = await this.cycleRepo.findOne({ where: { year: updateDto.year } });
      if (existing && existing.cycle_id !== cycleId) {
        throw new ConflictException(`Evaluation cycle for year ${updateDto.year} already exists.`);
      }
    }

    const updatedCycle = this.cycleRepo.merge(cycle, updateDto);
    return this.cycleRepo.save(updatedCycle);
  }

  async findAll() {
    return this.cycleRepo.find({ order: { year: 'DESC' } });
  }

  async assignFaculty(cycleId: number, dto: AssignFacultyToCycleDto) {
    // 1. Verify cycle exists
    const cycle = await this.cycleRepo.findOne({ where: { cycle_id: cycleId } });
    if (!cycle) {
      throw new NotFoundException(`Evaluation cycle #${cycleId} not found.`);
    }

    // 2. Verify all faculty IDs exist and are actually Faculty role
    const users = await this.userRepo.find({
      where: { user_id: In(dto.faculty_ids) },
    });

    if (users.length !== dto.faculty_ids.length) {
      throw new BadRequestException('One or more faculty IDs do not exist.');
    }

    const nonFacultyUsers = users.filter((u) => u.role !== UserRole.FACULTY);
    if (nonFacultyUsers.length > 0) {
      throw new BadRequestException(
        `The following users are not faculty: ${nonFacultyUsers.map((u) => u.user_id).join(', ')}`,
      );
    }

    // 3. Remove existing assignments for this cycle
    await this.cycleFacultyRepo.delete({ cycle_id: cycleId });

    // 4. Create new assignments
    const assignments = dto.faculty_ids.map((user_id) =>
      this.cycleFacultyRepo.create({
        cycle_id: cycleId,
        user_id,
      }),
    );

    await this.cycleFacultyRepo.save(assignments);

    return {
      message: `Successfully assigned ${assignments.length} faculty members to cycle #${cycleId}.`,
      assigned_count: assignments.length,
      cycle_id: cycleId,
    };
  }

  async getAssignedFaculty(cycleId: number) {
    // Verify cycle exists
    const cycle = await this.cycleRepo.findOne({ where: { cycle_id: cycleId } });
    if (!cycle) {
      throw new NotFoundException(`Evaluation cycle #${cycleId} not found.`);
    }

    return this.cycleFacultyRepo.find({
      where: { cycle_id: cycleId },
      relations: ['user'],
      select: {
        assignment_id: true,
        user_id: true,
        user: {
          user_id: true,
          full_name: true,
          email: true,
        },
      },
    });
  }

  async sendNominationEmails(cycleId: number) {
    // 1. Verify cycle exists
    const cycle = await this.cycleRepo.findOne({ where: { cycle_id: cycleId } });
    if (!cycle) {
      throw new NotFoundException(`Evaluation cycle #${cycleId} not found.`);
    }

    // 2. Get all assigned faculty
    const assignments = await this.cycleFacultyRepo.find({
      where: { cycle_id: cycleId },
      relations: ['user'],
    });

    if (assignments.length === 0) {
      throw new BadRequestException(`No faculty assigned to cycle #${cycleId}.`);
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL must be set to send nomination emails.');
    }

    const sentCount = { success: 0, failed: 0 };
    const failedFaculty: Array<{ user_id: number; email: string; error: string }> = [];

    // 3. For each faculty, create magic link and send email
    for (const assignment of assignments) {
      try {
        const user = assignment.user;

        // Create magic link
        const magicLink = await this.magicLinksService.createLink({
          user_id: user.user_id,
          purpose: MagicLinkPurpose.NOMINATION,
          reference_id: cycle.cycle_id,
        });

        // Build magic link URL
        const magicLinkUrl = `${frontendUrl}/nominate?token=${magicLink.token_hash}`;

        // Send email
        await this.emailService.sendNominationMagicLinkEmail(
          user.email,
          user.full_name,
          magicLinkUrl,
          `Year ${cycle.year}`,
        );

        sentCount.success++;
        this.logger.log(
          `Nomination email sent to faculty #${user.user_id} (${user.email}) for cycle #${cycleId}.`,
        );
      } catch (error) {
        sentCount.failed++;
        failedFaculty.push({
          user_id: assignment.user_id,
          email: assignment.user.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        this.logger.error(
          `Failed to send nomination email to faculty #${assignment.user_id} (${assignment.user.email}): ${error}`,
        );
      }
    }

    if (sentCount.failed > 0) {
      this.logger.warn(
        `Nomination email sending completed with ${sentCount.success} successes and ${sentCount.failed} failures.`,
      );
    }

    return {
      message: 'Nomination emails sent.',
      cycle_id: cycleId,
      cycle_year: cycle.year,
      sent_count: sentCount.success,
      failed_count: sentCount.failed,
      failed_faculty: failedFaculty.length > 0 ? failedFaculty : undefined,
    };
  }
}