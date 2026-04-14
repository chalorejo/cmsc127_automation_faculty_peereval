import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question) private readonly questionRepo: Repository<Question>,
  ) {}

  create(createDto: CreateQuestionDto) {
    const question = this.questionRepo.create(createDto);
    return this.questionRepo.save(question);
  }

  findAll() {
    return this.questionRepo.find();
  }

  async update(id: number, updateDto: UpdateQuestionDto) {
    const question = await this.questionRepo.preload({
      question_id: id,
      ...updateDto,
    });
    if (!question) throw new NotFoundException(`Question #${id} not found`);
    return this.questionRepo.save(question);
  }
}