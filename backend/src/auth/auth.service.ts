import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // For Admins/Chairs/Deans with passwords
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && user.password_hash && (await bcrypt.compare(pass, user.password_hash))) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  // Generic login function to generate a JWT for any valid user.
  // tokenId is optional and used for magic-link faculty flows.
  async login(user: User, tokenId?: number) {
    const payload = {
      email: user.email,
      sub: user.user_id,
      role: user.role,
      ...(tokenId ? { token_id: tokenId } : {}),
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}