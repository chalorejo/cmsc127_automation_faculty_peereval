import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationCyclesService } from './evaluation-cycles.service';
import { EvaluationCyclesController } from './evaluation-cycles.controller';
import { EvaluationCycle } from './entities/evaluation-cycle.entity';
import { EvaluationCycleFaculty } from './entities/evaluation-cycle-faculty.entity';
import { User } from '../users/entities/user.entity';
import { EmailModule } from '../email/email.module';
import { MagicLinksModule } from '../magic-links/magic-links.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EvaluationCycle, EvaluationCycleFaculty, User]),
    EmailModule,
    MagicLinksModule,
  ],
  controllers: [EvaluationCyclesController],
  providers: [EvaluationCyclesService],
  exports: [EvaluationCyclesService],
})
export class EvaluationCyclesModule {}