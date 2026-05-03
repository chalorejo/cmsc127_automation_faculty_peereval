import { Module } from '@nestjs/common';
import { PdfServicesService } from './pdf-services.service';
import { PdfServicesController } from './pdf-services.controller';
import { EvaluationSummariesModule } from '../evaluation-summaries/evaluation-summaries.module';

@Module({
  imports: [EvaluationSummariesModule],
  controllers: [PdfServicesController],
  providers: [PdfServicesService],
})
export class PdfServicesModule {}
