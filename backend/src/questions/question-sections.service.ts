import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionSection } from './entities/question-section.entity';
import { CreateQuestionSectionDto } from './dto/create-question-section.dto';
import { UpdateQuestionSectionDto } from './dto/update-question-section.dto';

@Injectable()
export class QuestionSectionsService {
  constructor(
    @InjectRepository(QuestionSection) private readonly sectionRepo: Repository<QuestionSection>,
  ) {}

  async create(createDto: CreateQuestionSectionDto) {
    // Check if section with same name already exists
    const existing = await this.sectionRepo.findOne({
      where: { name: createDto.name },
    });

    if (existing) {
      throw new ConflictException(`Section "${createDto.name}" already exists`);
    }

    const section = this.sectionRepo.create(createDto);
    return this.sectionRepo.save(section);
  }

  async findAll() {
    return this.sectionRepo.find({
      order: { order: 'ASC' },
      relations: ['questions'],
    });
  }

  async findById(id: number) {
    const section = await this.sectionRepo.findOne({
      where: { id },
      relations: ['questions'],
    });

    if (!section) {
      throw new NotFoundException(`Question section #${id} not found`);
    }

    return section;
  }

  async update(id: number, updateDto: UpdateQuestionSectionDto) {
    const section = await this.sectionRepo.preload({
      id,
      ...updateDto,
    });

    if (!section) {
      throw new NotFoundException(`Question section #${id} not found`);
    }

    // If name is being updated, check for duplicates
    if (updateDto.name) {
      const existing = await this.sectionRepo.findOne({
        where: { name: updateDto.name },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(`Section "${updateDto.name}" already exists`);
      }
    }

    return this.sectionRepo.save(section);
  }

  async delete(id: number) {
    const section = await this.findById(id);
    return this.sectionRepo.remove(section);
  }

  async findByName(name: string) {
    return this.sectionRepo.findOne({
      where: { name },
      relations: ['questions'],
    });
  }

  async findQuestionsInSection(sectionId: number) {
    const section = await this.findById(sectionId);
    return section.questions || [];
  }
}
