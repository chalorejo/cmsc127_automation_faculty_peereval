import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluationCycle } from './entities/evaluation-cycle.entity';
import { CreateEvaluationCycleDto } from './dto/create-evaluation-cycle.dto';

@Injectable()
export class EvaluationCyclesService {
  constructor(
    @InjectRepository(EvaluationCycle)
    private readonly cycleRepo: Repository<EvaluationCycle>,
  ) {}

  async create(createDto: CreateEvaluationCycleDto) {
    // Check if the year already exists to prevent duplicates
    const existing = await this.cycleRepo.findOne({ where: { year: createDto.year } });
    if (existing) {
      throw new ConflictException(`Evaluation cycle for year ${createDto.year} already exists.`);
    }

    const willBeActive = createDto.is_active ?? true;
    if (willBeActive) {
      const activeCycle = await this.cycleRepo.findOne({ where: { is_active: true } });
      if (activeCycle) {
        throw new ConflictException(
          `Cannot create a new active cycle while cycle #${activeCycle.cycle_id} is still active. Close the current cycle first.`,
        );
      }
    }

    const cycle = this.cycleRepo.create(createDto);
    return this.cycleRepo.save(cycle);
  }

  async findAll() {
    return this.cycleRepo.find({ order: { year: 'DESC' } });
  }
}