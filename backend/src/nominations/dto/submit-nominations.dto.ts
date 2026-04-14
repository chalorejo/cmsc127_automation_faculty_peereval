import { IsArray, ArrayMinSize, ArrayMaxSize, IsInt, IsOptional } from 'class-validator';

export class SubmitNominationsDto {
  @IsArray()
  @ArrayMinSize(1) // Adjust based on your rules (e.g., must pick exactly 5)
  @ArrayMaxSize(5)
  @IsInt({ each: true }) // Ensures every item in the array is an integer
  evaluator_ids: number[];

  @IsOptional()
  @IsInt()
  magic_token_id?: number; // Passed from the frontend's JWT payload
}