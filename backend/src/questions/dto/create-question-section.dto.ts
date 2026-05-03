import { IsString, IsInt, Min } from 'class-validator';

export class CreateQuestionSectionDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  order: number;
}
