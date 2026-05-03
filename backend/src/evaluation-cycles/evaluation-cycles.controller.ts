import { Controller, Post, Get, Body, UseGuards, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { EvaluationCyclesService } from './evaluation-cycles.service';
import { CreateEvaluationCycleDto } from './dto/create-evaluation-cycle.dto';
import { UpdateEvaluationCycleDto } from './dto/update-evaluation-cycle.dto';
import { AssignFacultyToCycleDto } from './dto/assign-faculty-to-cycle.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN) // ALL endpoints in this controller require ADMIN
@Controller('evaluation-cycles')
export class EvaluationCyclesController {
  constructor(private readonly cyclesService: EvaluationCyclesService) {}

  @Post()
  create(@Body() createDto: CreateEvaluationCycleDto) {
    return this.cyclesService.create(createDto);
  }

  @Get()
  findAll() {
    return this.cyclesService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateEvaluationCycleDto,
  ) {
    return this.cyclesService.update(id, updateDto);
  }

  @Post(':id/assign-faculty')
  assignFaculty(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignFacultyToCycleDto,
  ) {
    return this.cyclesService.assignFaculty(id, dto);
  }

  @Get(':id/faculty')
  getAssignedFaculty(@Param('id', ParseIntPipe) id: number) {
    return this.cyclesService.getAssignedFaculty(id);
  }

  @Post(':id/send-nomination-emails')
  sendNominationEmails(@Param('id', ParseIntPipe) id: number) {
    return this.cyclesService.sendNominationEmails(id);
  }
}