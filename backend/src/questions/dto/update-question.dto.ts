import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionDto } from './create-question.dto';
import { IsBoolean, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {
  @IsOptional()
  @IsBoolean()
  is_active?: boolean; // Mainly used to soft-delete/retire old questions

  @IsOptional()
  @IsInt()
  section_id?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  order_in_section?: number;
}