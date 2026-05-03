import { IsString, MinLength } from 'class-validator';

export class CreateCollegeDto {
	@IsString()
	@MinLength(2)
	name: string;
}
