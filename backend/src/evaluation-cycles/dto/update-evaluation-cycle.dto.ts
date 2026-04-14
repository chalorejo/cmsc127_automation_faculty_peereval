import { PartialType } from '@nestjs/mapped-types';
import { CreateEvaluationCycleDto } from './create-evaluation-cycle.dto';

export class UpdateEvaluationCycleDto extends PartialType(CreateEvaluationCycleDto) {}
