import { Test, TestingModule } from '@nestjs/testing';
import { PdfServicesController } from './pdf-services.controller';
import { PdfServicesService } from './pdf-services.service';

describe('PdfServicesController', () => {
  let controller: PdfServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PdfServicesController],
      providers: [PdfServicesService],
    }).compile();

    controller = module.get<PdfServicesController>(PdfServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
