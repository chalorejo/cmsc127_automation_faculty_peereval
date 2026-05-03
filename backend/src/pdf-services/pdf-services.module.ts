import { Module } from '@nestjs/common';
import { PdfServicesService } from './pdf-services.service';
import { PdfServicesController } from './pdf-services.controller';

@Module({
  controllers: [PdfServicesController],
  providers: [PdfServicesService],
})
export class PdfServicesModule {}
