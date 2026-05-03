import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionSectionDto } from './create-question-section.dto';

export class UpdateQuestionSectionDto extends PartialType(CreateQuestionSectionDto) {}
