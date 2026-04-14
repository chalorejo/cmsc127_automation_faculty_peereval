import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { EvaluationSummary } from './entities/evaluation-summary.entity';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class EvaluationSummariesService {
  constructor(
    @InjectRepository(EvaluationSummary) private summaryRepo: Repository<EvaluationSummary>,
  ) {}

  async findMySummaries(evaluateeId: number) {
    return this.summaryRepo.find({
      where: { 
        evaluatee_id: evaluateeId,
        chair_sign_id: Not(IsNull()), // Must be signed by chair
        dean_sign_id: Not(IsNull()),  // Must be signed by dean
      },
      relations: ['cycle'], // Join the cycle to show the year
      order: { cycle: { year: 'DESC' } },
    });
  }

  async findPendingSignature(role: UserRole) {
    if (role === UserRole.DEP_CHAIR) {
      return this.summaryRepo.find({
        where: { chair_sign_id: IsNull() },
        relations: ['cycle', 'evaluatee'],
        order: { summary_id: 'ASC' },
      });
    }

    if (role === UserRole.DEAN) {
      return this.summaryRepo.find({
        where: {
          chair_sign_id: Not(IsNull()),
          dean_sign_id: IsNull(),
        },
        relations: ['cycle', 'evaluatee', 'chairSign'],
        order: { summary_id: 'ASC' },
      });
    }

    throw new ForbiddenException('Only Department Chair or Dean can access pending signatures.');
  }

  async signSummary(summaryId: number, signerId: number, role: UserRole) {
    const summary = await this.summaryRepo.findOne({ where: { summary_id: summaryId } });

    if (!summary) {
      throw new NotFoundException(`Evaluation summary #${summaryId} not found`);
    }

    if (role === UserRole.DEP_CHAIR) {
      if (summary.chair_sign_id) {
        throw new BadRequestException('This summary is already signed by a Department Chair.');
      }

      summary.chair_sign_id = signerId;
      await this.summaryRepo.save(summary);
      return { message: 'Summary signed by Department Chair.' };
    }

    if (role === UserRole.DEAN) {
      if (!summary.chair_sign_id) {
        throw new BadRequestException('Dean cannot sign before Department Chair signature.');
      }

      if (summary.dean_sign_id) {
        throw new BadRequestException('This summary is already signed by a Dean.');
      }

      summary.dean_sign_id = signerId;
      await this.summaryRepo.save(summary);
      return { message: 'Summary signed by Dean.' };
    }

    throw new ForbiddenException('Only Department Chair or Dean can sign summaries.');
  }

  async findByFacultyId(facultyId: number) {
    return this.summaryRepo.find({
      where: { evaluatee_id: facultyId },
      relations: ['cycle', 'evaluatee', 'chairSign', 'deanSign'],
      order: { cycle: { year: 'DESC' } },
    });
  }
}