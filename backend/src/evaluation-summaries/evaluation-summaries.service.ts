import { Injectable } from '@nestjs/common';
import { CreateEvaluationSummaryDto } from './dto/create-evaluation-summary.dto';
import { UpdateEvaluationSummaryDto } from './dto/update-evaluation-summary.dto';

@Injectable()
export class EvaluationSummariesService {
  create(createEvaluationSummaryDto: CreateEvaluationSummaryDto) {
    return 'This action adds a new evaluationSummary';
  }

  findAll() {
    return `This action returns all evaluationSummaries`;
  }

  findOne(id: number) {
    return `This action returns a #${id} evaluationSummary`;
  }

  update(id: number, updateEvaluationSummaryDto: UpdateEvaluationSummaryDto) {
    return `This action updates a #${id} evaluationSummary`;
  }

  remove(id: number) {
    return `This action removes a #${id} evaluationSummary`;
  }
}
