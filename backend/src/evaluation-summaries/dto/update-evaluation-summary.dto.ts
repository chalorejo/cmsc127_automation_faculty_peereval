import { PartialType } from '@nestjs/mapped-types';
import { CreateEvaluationSummaryDto } from './create-evaluation-summary.dto';

export class UpdateEvaluationSummaryDto extends PartialType(CreateEvaluationSummaryDto) {}
