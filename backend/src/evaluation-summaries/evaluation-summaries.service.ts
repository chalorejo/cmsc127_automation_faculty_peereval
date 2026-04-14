import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { EvaluationSummary } from './entities/evaluation-summary.entity';

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
}