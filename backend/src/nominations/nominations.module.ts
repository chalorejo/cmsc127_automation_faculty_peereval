import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NominationsService } from './nominations.service';
import { NominationsController } from './nominations.controller';
import { Nomination } from './entities/nomination.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Nomination])],
  controllers: [NominationsController],
  providers: [NominationsService],
  exports: [NominationsService],
})
export class NominationsModule {}