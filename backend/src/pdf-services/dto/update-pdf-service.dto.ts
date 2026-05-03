import { PartialType } from '@nestjs/mapped-types';
import { CreatePdfServiceDto } from './create-pdf-service.dto';

export class UpdatePdfServiceDto extends PartialType(CreatePdfServiceDto) {}
