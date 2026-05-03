import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { SendMailOptions, Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const secure = this.configService.get<boolean>('SMTP_SECURE', false);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    const from =
      this.configService.get<string>('SMTP_FROM') ||
      this.configService.get<string>('SMTP_USER');

    if (!from) {
      this.logger.error('SMTP_FROM or SMTP_USER must be set to send email.');
      throw new Error('Missing sender address for email.');
    }

    const mailOptions: SendMailOptions = {
      from,
      ...options,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent: ${info.messageId}`);
    } catch (error) {
      this.logger.error('Failed to send email', JSON.stringify(error));
      throw error;
    }
  }

  async sendReminderEmail(
    to: string,
    fullName: string,
    reminder: string,
    subject = 'Reminder',
  ): Promise<void> {
    const text = `Good day ${fullName}!\n\nThis email is a reminder to ${reminder}.`;

    await this.sendMail({
      to,
      subject,
      text,
    });
  }
}
