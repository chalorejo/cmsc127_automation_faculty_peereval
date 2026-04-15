import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationCyclesService } from './evaluation-cycles.service';
import { EvaluationCyclesController } from './evaluation-cycles.controller';
import { EvaluationCycle } from './entities/evaluation-cycle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EvaluationCycle])],
  controllers: [EvaluationCyclesController],
  providers: [EvaluationCyclesService],
  exports: [EvaluationCyclesService],
})
export class EvaluationCyclesModule {}