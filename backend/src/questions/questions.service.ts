import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { QuestionSection } from './entities/question-section.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question) private readonly questionRepo: Repository<Question>,
    @InjectRepository(QuestionSection) private readonly sectionRepo: Repository<QuestionSection>,
  ) {}

  async create(createDto: CreateQuestionDto) {
    // Validate section exists if section_id is provided
    if (createDto.section_id) {
      const section = await this.sectionRepo.findOne({
        where: { id: createDto.section_id },
      });
      if (!section) {
        throw new BadRequestException(`Question section #${createDto.section_id} not found`);
      }
    }

    const question = this.questionRepo.create(createDto);
    return this.questionRepo.save(question);
  }

  findAll() {
    return this.questionRepo.find({
      relations: ['section'],
      order: { section_id: 'ASC', order_in_section: 'ASC' },
    });
  }

  async update(id: number, updateDto: UpdateQuestionDto) {
    // Validate section exists if section_id is being updated
    if (updateDto.section_id) {
      const section = await this.sectionRepo.findOne({
        where: { id: updateDto.section_id },
      });
      if (!section) {
        throw new BadRequestException(`Question section #${updateDto.section_id} not found`);
      }
    }

    const question = await this.questionRepo.preload({
      question_id: id,
      ...updateDto,
    });
    if (!question) throw new NotFoundException(`Question #${id} not found`);
    return this.questionRepo.save(question);
  }

  async findActive() {
    return this.questionRepo.find({
      where: { is_active: true },
      relations: ['section'],
      order: { section_id: 'ASC', order_in_section: 'ASC' },
    });
  }

  async findAllWithSections() {
    return this.questionRepo.find({
      relations: ['section'],
      order: { section_id: 'ASC', order_in_section: 'ASC' },
    });
  }

  async findAllBySectionId(sectionId: number) {
    return this.questionRepo.find({
      where: { section_id: sectionId },
      order: { order_in_section: 'ASC' },
    });
  }
}