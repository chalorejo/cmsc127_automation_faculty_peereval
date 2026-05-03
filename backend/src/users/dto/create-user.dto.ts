import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  full_name: string;

  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsString()
  password?: string; // Optional because Faculty don't need one

  @IsOptional()
  @IsString()
  image?: string; // Base64 encoded image string from frontend
}