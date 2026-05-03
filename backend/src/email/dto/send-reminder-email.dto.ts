import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SendReminderEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  full_name: string;

  @IsString()
  reminder: string;

  @IsOptional()
  @IsString()
  subject?: string;
}
