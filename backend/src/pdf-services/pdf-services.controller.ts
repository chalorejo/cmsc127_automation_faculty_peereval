import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PdfServicesService } from './pdf-services.service';
import { CreatePdfServiceDto } from './dto/create-pdf-service.dto';
import { UpdatePdfServiceDto } from './dto/update-pdf-service.dto';

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
}
