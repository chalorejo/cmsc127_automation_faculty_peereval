import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendTestEmailDto } from './dto/send-test-email.dto';
import { SendReminderEmailDto } from './dto/send-reminder-email.dto';
import { SendFacultyReminderDto } from './dto/send-faculty-reminder.dto';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
  ) {}

  @Post('test')
  async sendTestEmail(@Body() body: SendTestEmailDto): Promise<{ message: string }>
  {
    const subject = body.subject ?? 'SMTP Test Email';
    const text =
      body.text ??
      `This is a test email from the CMSC127 automation backend.\n\nSent to: ${body.to}`;

    await this.emailService.sendMail({
      to: body.to,
      subject,
      text,
      html: body.html,
    });

    return { message: 'Test email sent.' };
  }

  @Post('reminder')
  async sendReminderEmail(@Body() body: SendReminderEmailDto): Promise<{ message: string }> {
    await this.emailService.sendReminderEmail(
      body.to,
      body.full_name,
      body.reminder,
      body.subject,
    );

    return { message: 'Reminder email sent.' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DEP_CHAIR, UserRole.DEAN)
  @Post('reminder/faculty')
  async sendFacultyReminders(
    @Body() body: SendFacultyReminderDto,
  ): Promise<{ message: string; count: number }> {
    const faculty = await this.usersService.findAllFaculty();

    await Promise.all(
      faculty.map((user) =>
        this.emailService.sendReminderEmail(
          user.email,
          user.full_name,
          body.reminder,
          body.subject,
        ),
      ),
    );

    return { message: 'Faculty reminders sent.', count: faculty.length };
  }
}
