import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EvaluationSummariesService } from './evaluation-summaries.service';
import { CreateEvaluationSummaryDto } from './dto/create-evaluation-summary.dto';
import { UpdateEvaluationSummaryDto } from './dto/update-evaluation-summary.dto';

@Controller('evaluation-summaries')
export class EvaluationSummariesController {
  constructor(private readonly evaluationSummariesService: EvaluationSummariesService) {}

  @Post()
  create(@Body() createEvaluationSummaryDto: CreateEvaluationSummaryDto) {
    return this.evaluationSummariesService.create(createEvaluationSummaryDto);
  }

  @Get()
  findAll() {
    return this.evaluationSummariesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.evaluationSummariesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEvaluationSummaryDto: UpdateEvaluationSummaryDto) {
    return this.evaluationSummariesService.update(+id, updateEvaluationSummaryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.evaluationSummariesService.remove(+id);
  }
}
