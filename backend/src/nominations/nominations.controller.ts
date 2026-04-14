import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { NominationsService } from './nominations.service';
import { SubmitNominationsDto } from './dto/submit-nominations.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('nominations')
export class NominationsController {
  constructor(private readonly nominationsService: NominationsService) {}

  @Roles(UserRole.FACULTY)
  @Post('submit')
  submit(@Request() req, @Body() dto: SubmitNominationsDto) {
    // req.user.user_id guarantees they are submitting FOR THEMSELVES
    return this.nominationsService.submitNominations(req.user.user_id, dto);
  }
}