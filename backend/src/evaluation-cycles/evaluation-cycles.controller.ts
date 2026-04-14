import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EvaluationCyclesService } from './evaluation-cycles.service';
import { CreateEvaluationCycleDto } from './dto/create-evaluation-cycle.dto';
import { UpdateEvaluationCycleDto } from './dto/update-evaluation-cycle.dto';

@Controller('evaluation-cycles')
export class EvaluationCyclesController {
  constructor(private readonly evaluationCyclesService: EvaluationCyclesService) {}

  @Post()
  create(@Body() createEvaluationCycleDto: CreateEvaluationCycleDto) {
    return this.evaluationCyclesService.create(createEvaluationCycleDto);
  }

  @Get()
  findAll() {
    return this.evaluationCyclesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.evaluationCyclesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEvaluationCycleDto: UpdateEvaluationCycleDto) {
    return this.evaluationCyclesService.update(+id, updateEvaluationCycleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.evaluationCyclesService.remove(+id);
  }
}
