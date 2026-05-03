import { IsArray, IsInt, Min } from 'class-validator';

export class AssignFacultyToCycleDto {
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  faculty_ids: number[];
}
