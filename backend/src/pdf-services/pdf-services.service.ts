import { Injectable } from '@nestjs/common';
import { CreatePdfServiceDto } from './dto/create-pdf-service.dto';
import { UpdatePdfServiceDto } from './dto/update-pdf-service.dto';

@Injectable()
export class PdfServicesService {
  create(createPdfServiceDto: CreatePdfServiceDto) {
    return 'This action adds a new pdfService';
  }

  findAll() {
    return `This action returns all pdfServices`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pdfService`;
  }

  update(id: number, updatePdfServiceDto: UpdatePdfServiceDto) {
    return `This action updates a #${id} pdfService`;
  }

  remove(id: number) {
    return `This action removes a #${id} pdfService`;
  }
}
