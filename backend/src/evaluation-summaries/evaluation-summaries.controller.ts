import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { EvaluationSummariesService } from './evaluation-summaries.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('evaluation-summaries')
export class EvaluationSummariesController {
  constructor(private readonly summariesService: EvaluationSummariesService) {}

  @Roles(UserRole.FACULTY)
  @Get('my-summaries')
  getMySummaries(@Request() req) {
    // Security: They can ONLY fetch records where evaluatee_id matches their token
    return this.summariesService.findMySummaries(req.user.user_id);
  }
}