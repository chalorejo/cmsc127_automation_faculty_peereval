import { PartialType } from '@nestjs/mapped-types';
import { CreateCollegeDto } from './create-college.dto';

export class UpdateCollegeDto extends PartialType(CreateCollegeDto) {}
