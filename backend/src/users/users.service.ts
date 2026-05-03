import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { College } from '../college/entities/college.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(College) private readonly collegeRepo: Repository<College>,
  ) {}

  private serializeUser(user: User) {
    return {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      college_id: user.college_id ?? null,
      college_name: user.college?.name ?? null,
      image_base64: user.image ? user.image.toString('base64') : null,
    };
  }

  private async resolveCollege(collegeId?: number) {
    if (collegeId == null) {
      return null;
    }

    const college = await this.collegeRepo.findOne({
      where: { college_id: collegeId },
    });

    if (!college) {
      throw new NotFoundException(`College #${collegeId} not found`);
    }

    return college;
  }

  async create(createDto: CreateUserDto) {
    const existing = await this.userRepo.findOne({ where: { email: createDto.email } });
    if (existing) throw new ConflictException('Email already in use.');

    // Extract image before passing to create
    const { image: imageBase64, college_id, ...createData } = createDto;
    const user = this.userRepo.create(createData as Partial<User>);
    const college = await this.resolveCollege(college_id);

    // Business Logic: Admins, Chairs, and Deans REQUIRE a password. Faculty DO NOT.
    if (user.role !== UserRole.FACULTY) {
      if (!createDto.password) {
        throw new BadRequestException(`Password is required for role: ${user.role}`);
      }
      user.password_hash = await bcrypt.hash(createDto.password, 10);
    }

    // Convert base64 image to Buffer if provided
    if (imageBase64) {
      try {
        user.image = Buffer.from(imageBase64, 'base64');
      } catch (err) {
        throw new BadRequestException('Invalid base64 image provided.');
      }
    }

    if (college) {
      user.college = college;
      user.college_id = college.college_id;
    }

    return this.serializeUser(await this.userRepo.save(user));
  }

  findAll() {
    return this.userRepo.find({ relations: ['college'] }).then((users) => users.map((user) => this.serializeUser(user)));
  }

  async update(id: number, updateDto: UpdateUserDto) {
    // Extract image before passing to preload
    const { image: imageBase64, college_id, ...updateData } = updateDto;
    const user = await this.userRepo.preload({
      user_id: id,
      ...updateData,
    } as any);

    if (!user) throw new NotFoundException(`User #${id} not found`);

    if (updateDto.password) {
      user.password_hash = await bcrypt.hash(updateDto.password, 10);
    }

    // Convert base64 image to Buffer if provided
    if (imageBase64) {
      try {
        user.image = Buffer.from(imageBase64, 'base64');
      } catch (err) {
        throw new BadRequestException('Invalid base64 image provided.');
      }
    }

    if (college_id !== undefined) {
      const college = await this.resolveCollege(college_id);
      user.college = college;
      user.college_id = college?.college_id ?? null;
    }

    return this.serializeUser(await this.userRepo.save(user));
  }

  // Used by AuthService for login
  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email },
      select: ['user_id', 'email', 'password_hash', 'role', 'full_name'], // Explicitly select password_hash
    });
  }

  async findOneById(id: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { user_id: id },
      relations: ['college'],
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
  }

  async findAllFaculty() {
    const users = await this.userRepo.find({
      where: { role: UserRole.FACULTY },
      relations: ['college'],
    });

    return users.map((user) => this.serializeUser(user));
  }

  async getUserWithImage(id: number) {
    const user = await this.userRepo.findOne({
      where: { user_id: id },
      relations: ['college'],
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return this.serializeUser(user);
  }
}