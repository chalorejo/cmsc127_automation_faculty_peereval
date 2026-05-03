import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCollegeDto } from './dto/create-college.dto';
import { UpdateCollegeDto } from './dto/update-college.dto';
import { College } from './entities/college.entity';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class CollegeService {
  constructor(
    @InjectRepository(College)
    private readonly collegeRepo: Repository<College>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  create(createCollegeDto: CreateCollegeDto) {
    return this.createCollege(createCollegeDto);
  }

  findAll() {
    return this.collegeRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number) {
    const college = await this.collegeRepo.findOne({
      where: { college_id: id },
      relations: ['users'],
    });

    if (!college) {
      throw new NotFoundException(`College #${id} not found`);
    }

    return college;
  }

  async update(id: number, updateCollegeDto: UpdateCollegeDto) {
    const college = await this.collegeRepo.preload({
      college_id: id,
      ...updateCollegeDto,
    });

    if (!college) {
      throw new NotFoundException(`College #${id} not found`);
    }

    if (updateCollegeDto.name) {
      const duplicate = await this.collegeRepo.findOne({
        where: { name: updateCollegeDto.name },
      });

      if (duplicate && duplicate.college_id !== id) {
        throw new ConflictException('College name already in use.');
      }
    }

    return this.collegeRepo.save(college);
  }

  async remove(id: number) {
    const result = await this.collegeRepo.delete(id);

    if (!result.affected) {
      throw new NotFoundException(`College #${id} not found`);
    }

    return { message: `College #${id} removed successfully` };
  }

  async findFaculty(id: number) {
    const college = await this.collegeRepo.findOne({
      where: { college_id: id },
    });

    if (!college) {
      throw new NotFoundException(`College #${id} not found`);
    }

    const faculty = await this.userRepo.find({
      where: {
        college_id: id,
        role: UserRole.FACULTY,
      },
      relations: ['college'],
      order: { full_name: 'ASC' },
    });

    return faculty.map((user) => ({
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      college_id: user.college_id ?? null,
      college_name: user.college?.name ?? null,
      image_base64: user.image ? user.image.toString('base64') : null,
    }));
  }

  private async createCollege(createCollegeDto: CreateCollegeDto) {
    const duplicate = await this.collegeRepo.findOne({
      where: { name: createCollegeDto.name },
    });

    if (duplicate) {
      throw new ConflictException('College name already in use.');
    }

    const college = this.collegeRepo.create(createCollegeDto);
    return this.collegeRepo.save(college);
  }
}
