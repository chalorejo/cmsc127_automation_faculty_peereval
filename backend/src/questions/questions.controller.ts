import { Controller, Post, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createDto: CreateQuestionDto) {
    return this.questionsService.create(createDto);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.questionsService.findAll(); // Shows ALL questions (even inactive ones for admin view)
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateQuestionDto) {
    return this.questionsService.update(+id, updateDto);
  }
}