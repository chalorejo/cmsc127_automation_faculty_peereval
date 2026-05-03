import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async create(createDto: CreateUserDto) {
    const existing = await this.userRepo.findOne({ where: { email: createDto.email } });
    if (existing) throw new ConflictException('Email already in use.');

    // Extract image before passing to create
    const { image: imageBase64, ...createData } = createDto;
    const user = this.userRepo.create(createData as Partial<User>);

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

    return this.userRepo.save(user);
  }

  findAll() {
    return this.userRepo.find();
  }

  async update(id: number, updateDto: UpdateUserDto) {
    // Extract image before passing to preload
    const { image: imageBase64, ...updateData } = updateDto;
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

    return this.userRepo.save(user);
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
      select: ['user_id', 'email', 'role', 'full_name'],
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
  }

  async findAllFaculty() {
    return this.userRepo.find({
      where: { role: UserRole.FACULTY },
      select: ['user_id', 'full_name', 'email'], // Only send safe data
    });
  }

  async getUserWithImage(id: number) {
    const user = await this.userRepo.findOne({
      where: { user_id: id },
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      image_base64: user.image ? user.image.toString('base64') : null,
    };
  }
}