import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NominationsService } from './nominations.service';
import { NominationsController } from './nominations.controller';
import { Nomination } from './entities/nomination.entity';
import { EmailModule } from '../email/email.module';
import { MagicLinksModule } from '../magic-links/magic-links.module';

@Module({
  imports: [TypeOrmModule.forFeature([Nomination]), EmailModule, MagicLinksModule],
  controllers: [NominationsController],
  providers: [NominationsService],
  exports: [NominationsService],
})
export class NominationsModule {}