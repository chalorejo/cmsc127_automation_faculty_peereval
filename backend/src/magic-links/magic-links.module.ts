import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MagicLinksService } from './magic-links.service';
import { MagicLinksController } from './magic-links.controller';
import { MagicLink } from './entities/magic-link.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([MagicLink]), AuthModule, UsersModule],
  controllers: [MagicLinksController],
  providers: [MagicLinksService],
  exports: [MagicLinksService],
})
export class MagicLinksModule {}