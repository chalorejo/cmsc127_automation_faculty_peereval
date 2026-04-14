import { IsInt, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class CreateEvaluationCycleDto {
  @IsInt()
  year: number;

  @IsDateString()
  start_date: string; // YYYY-MM-DD

  @IsDateString()
  end_date: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}