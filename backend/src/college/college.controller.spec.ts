import { Test, TestingModule } from '@nestjs/testing';
import { CollegeController } from './college.controller';
import { CollegeService } from './college.service';

describe('CollegeController', () => {
  let controller: CollegeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollegeController],
      providers: [CollegeService],
    }).compile();

    controller = module.get<CollegeController>(CollegeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
