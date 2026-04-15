import { PartialType } from '@nestjs/mapped-types';
import { CreateNominationDto } from './create-nomination.dto';

export class UpdateNominationDto extends PartialType(CreateNominationDto) {}
