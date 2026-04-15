import { IsArray, ArrayMinSize, ArrayMaxSize, IsInt } from 'class-validator';

export class SubmitNominationsDto {
  @IsArray()
  @ArrayMinSize(5)
  @ArrayMaxSize(5)
  @IsInt({ each: true }) // Ensures every item in the array is an integer
  evaluator_ids: number[];
}