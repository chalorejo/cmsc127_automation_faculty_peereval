import { IsString, IsEnum, IsBoolean, IsOptional, IsInt, Min } from 'class-validator';
import { QuestionType } from '../entities/question.entity';

export class CreateQuestionDto {
  @IsString()
  question_text: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsOptional()
  @IsBoolean()
  is_required?: boolean;

  @IsOptional()
  @IsInt()
  section_id?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  order_in_section?: number;
}