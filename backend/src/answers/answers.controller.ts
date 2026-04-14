import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { SubmitEvaluationDto } from './dto/submit-evaluation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Roles(UserRole.FACULTY)
  @Post('submit-evaluation')
  submitEvaluation(@Request() req, @Body() dto: SubmitEvaluationDto) {
    // req.user.user_id guarantees the logged-in user is the designated evaluator
    return this.answersService.submitAnswers(req.user.user_id, dto, req.user.token_id);
  }
}