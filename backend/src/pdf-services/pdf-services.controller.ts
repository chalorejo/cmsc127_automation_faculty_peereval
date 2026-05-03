import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Res, ParseIntPipe, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { PdfServicesService } from './pdf-services.service';
import { CreatePdfServiceDto } from './dto/create-pdf-service.dto';
import { UpdatePdfServiceDto } from './dto/update-pdf-service.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pdf-services')
export class PdfServicesController {
  constructor(private readonly pdfServicesService: PdfServicesService) {}

  @Post()
  create(@Body() createPdfServiceDto: CreatePdfServiceDto) {
    return this.pdfServicesService.create(createPdfServiceDto);
  }

  @Get()
  findAll() {
    return this.pdfServicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pdfServicesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePdfServiceDto: UpdatePdfServiceDto) {
    return this.pdfServicesService.update(+id, updatePdfServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pdfServicesService.remove(+id);
  }

  @Roles(UserRole.FACULTY, UserRole.DEP_CHAIR, UserRole.DEAN, UserRole.ADMIN)
  @Get('evaluation-summary/:id/pdf')
  async getEvaluationSummaryPdf(@Param('id', ParseIntPipe) id: number, @Request() req, @Res() res: Response) {
    const pdfBuffer = await this.pdfServicesService.generateEvaluationSummaryPdf(id, req.user.user_id, req.user.role);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="evaluation-summary-${id}.pdf"`,
    });
    res.send(pdfBuffer);
  }
}
