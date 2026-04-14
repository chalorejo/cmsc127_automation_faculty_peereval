import { Injectable } from '@nestjs/common';
import { CreateEvaluationCycleDto } from './dto/create-evaluation-cycle.dto';
import { UpdateEvaluationCycleDto } from './dto/update-evaluation-cycle.dto';

@Injectable()
export class EvaluationCyclesService {
  create(createEvaluationCycleDto: CreateEvaluationCycleDto) {
    return 'This action adds a new evaluationCycle';
  }

  findAll() {
    return `This action returns all evaluationCycles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} evaluationCycle`;
  }

  update(id: number, updateEvaluationCycleDto: UpdateEvaluationCycleDto) {
    return `This action updates a #${id} evaluationCycle`;
  }

  remove(id: number) {
    return `This action removes a #${id} evaluationCycle`;
  }
}
