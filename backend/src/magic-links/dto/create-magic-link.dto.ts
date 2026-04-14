import { IsInt, IsEnum } from 'class-validator';
import { MagicLinkPurpose } from '../entities/magic-link.entity';

export class CreateMagicLinkDto {
  @IsInt()
  user_id: number;

  @IsEnum(MagicLinkPurpose)
  purpose: MagicLinkPurpose;

  @IsInt()
  reference_id: number;
}