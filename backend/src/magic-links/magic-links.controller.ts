import { Controller, Get, Param, UnauthorizedException } from '@nestjs/common';
import { MagicLinksService } from './magic-links.service';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@Controller('magic-links')
export class MagicLinksController {
  constructor(
    private readonly magicLinksService: MagicLinksService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Get('validate/:token')
  async validateToken(@Param('token') tokenHash: string) {
    // 1. Find the link by its hash and check if it's valid/expired/used
    // (Assume you created a validateLink method in MagicLinksService)
    const magicLink = await this.magicLinksService.validateLink(tokenHash);
    
    if (!magicLink) {
      throw new UnauthorizedException('Invalid or expired link.');
    }

    // 2. Fetch the user associated with this link
    const user = await this.usersService.findOneById(magicLink.user_id);
    
    // 3. Generate the JWT and return context needed by the frontend workflow
    const auth = await this.authService.login(user, magicLink.token_id);

    return {
      ...auth,
      purpose: magicLink.purpose,
      user_id: magicLink.user_id,
      token_id: magicLink.token_id,
      reference_id: magicLink.reference_id,
    };
  }
}