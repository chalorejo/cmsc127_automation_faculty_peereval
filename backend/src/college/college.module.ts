import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollegeService } from './college.service';
import { CollegeController } from './college.controller';
import { College } from './entities/college.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([College, User])],
  controllers: [CollegeController],
  providers: [CollegeService],
})
export class CollegeModule {}
