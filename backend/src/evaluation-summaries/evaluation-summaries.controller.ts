import { Controller, Get, UseGuards, Request, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { EvaluationSummariesService } from './evaluation-summaries.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('evaluation-summaries')
export class EvaluationSummariesController {
  constructor(private readonly summariesService: EvaluationSummariesService) {}

  @Roles(UserRole.DEP_CHAIR, UserRole.DEAN)
  @Get('pending-signature')
  getPendingSignature(@Request() req) {
    return this.summariesService.findPendingSignature(req.user.role);
  }

  @Roles(UserRole.DEP_CHAIR, UserRole.DEAN)
  @Patch(':id/sign')
  signSummary(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.summariesService.signSummary(id, req.user.user_id, req.user.role);
  }

  @Roles(UserRole.DEP_CHAIR, UserRole.DEAN)
  @Get('faculty/:id')
  getFacultySummary(@Param('id', ParseIntPipe) facultyId: number) {
    return this.summariesService.findByFacultyId(facultyId);
  }

  @Roles(UserRole.FACULTY)
  @Get('my-summaries')
  getMySummaries(@Request() req) {
    // Security: They can ONLY fetch records where evaluatee_id matches their token
    return this.summariesService.findMySummaries(req.user.user_id);
  }

  @Roles(UserRole.FACULTY, UserRole.DEP_CHAIR, UserRole.DEAN, UserRole.ADMIN)
  @Get(':id/pdf-data')
  getPdfData(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.summariesService.getPdfData(id, req.user.user_id, req.user.role);
  }

  @Roles(UserRole.FACULTY, UserRole.DEP_CHAIR, UserRole.DEAN, UserRole.ADMIN)
  @Get(':id/pdf-structure')
  getPdfStructure(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.summariesService.getPdfStructure(id, req.user.user_id, req.user.role);
  }
}