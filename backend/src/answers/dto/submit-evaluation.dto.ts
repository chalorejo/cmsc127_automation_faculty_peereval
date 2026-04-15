import { IsArray, IsInt, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDto {
  @IsInt()
  question_id: number;

  @IsOptional()
  @IsNumber()
  numeric_score?: number;

  @IsOptional()
  @IsString()
  text_response?: string;
}

export class SubmitEvaluationDto {
  @IsInt()
  evaluation_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}