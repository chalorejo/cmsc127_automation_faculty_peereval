import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { QuestionSectionsService } from './question-sections.service';
import { CreateQuestionSectionDto } from './dto/create-question-section.dto';
import { UpdateQuestionSectionDto } from './dto/update-question-section.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('question-sections')
export class QuestionSectionsController {
  constructor(private readonly sectionService: QuestionSectionsService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createDto: CreateQuestionSectionDto) {
    return this.sectionService.create(createDto);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.sectionService.findAll();
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.sectionService.findById(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateQuestionSectionDto) {
    return this.sectionService.update(id, updateDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.sectionService.delete(id);
  }

  @Roles(UserRole.ADMIN)
  @Get(':id/questions')
  findQuestions(@Param('id', ParseIntPipe) id: number) {
    return this.sectionService.findQuestionsInSection(id);
  }
}
