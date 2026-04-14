import { Controller, Post, Body, UseGuards, Request, Get, Patch, ParseArrayPipe } from '@nestjs/common';
import { NominationsService } from './nominations.service';
import { SubmitNominationsDto } from './dto/submit-nominations.dto';
import { ReviewNominationItemDto } from './dto/review-nominations.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('nominations')
export class NominationsController {
  constructor(private readonly nominationsService: NominationsService) {}

  @Roles(UserRole.DEP_CHAIR)
  @Get('pending-approval')
  getPendingApproval() {
    return this.nominationsService.findPendingApprovalGrouped();
  }

  @Roles(UserRole.DEP_CHAIR)
  @Patch('review')
  review(
    @Request() req,
    @Body(new ParseArrayPipe({ items: ReviewNominationItemDto })) decisions: ReviewNominationItemDto[],
  ) {
    return this.nominationsService.reviewNominations(req.user.user_id, decisions);
  }

  @Roles(UserRole.FACULTY)
  @Post('submit')
  submit(@Request() req, @Body() dto: SubmitNominationsDto) {
    // Pass req.user.token_id directly into the service!
    return this.nominationsService.submitNominations(
      req.user.user_id, 
      dto, 
      req.user.token_id
    );
  }
}