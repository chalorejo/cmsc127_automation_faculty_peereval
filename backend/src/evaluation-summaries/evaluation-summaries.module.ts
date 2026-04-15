import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationSummariesService } from './evaluation-summaries.service';
import { EvaluationSummariesController } from './evaluation-summaries.controller';
import { EvaluationSummary } from './entities/evaluation-summary.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EvaluationSummary])],
  controllers: [EvaluationSummariesController],
  providers: [EvaluationSummariesService],
  exports: [EvaluationSummariesService],
})
export class EvaluationSummariesModule {}