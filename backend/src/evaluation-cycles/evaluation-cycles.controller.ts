import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { EvaluationCyclesService } from './evaluation-cycles.service';
import { CreateEvaluationCycleDto } from './dto/create-evaluation-cycle.dto';
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
}