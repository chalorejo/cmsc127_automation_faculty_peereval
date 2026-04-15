import { PartialType } from '@nestjs/mapped-types';
import { CreateMagicLinkDto } from './create-magic-link.dto';

export class UpdateMagicLinkDto extends PartialType(CreateMagicLinkDto) {}
