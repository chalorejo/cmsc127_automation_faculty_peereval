import { IsEnum, IsInt } from 'class-validator';
import { NominationStatus } from '../entities/nomination.entity';

export class ReviewNominationItemDto {
  @IsInt()
  nomination_id: number;

  @IsEnum(NominationStatus)
  status: NominationStatus;
}
