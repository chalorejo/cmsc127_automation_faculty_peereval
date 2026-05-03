import { IsOptional, IsString } from 'class-validator';

export class SendFacultyReminderDto {
  @IsString()
  reminder: string;

  @IsOptional()
  @IsString()
  subject?: string;
}
