import { Test, TestingModule } from '@nestjs/testing';
import { PdfServicesService } from './pdf-services.service';

describe('PdfServicesService', () => {
  let service: PdfServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfServicesService],
    }).compile();

    service = module.get<PdfServicesService>(PdfServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
