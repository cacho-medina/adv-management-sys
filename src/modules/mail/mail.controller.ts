import { Controller, Get, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('verify-connection')
  async verifyConnection() {
    return this.mailService.verifyConnection();
  }

  @Post('send-test')
  async sendTestEmail(@Body('to') to: string) {
    console.log(to);
    return this.mailService.sendTemplateMail({
      to,
      subject: 'Correo de prueba 🚀',
      template: 'test-email',
      context: {
        name: 'Tester',
        message: 'Este es un correo de prueba enviado con Handlebars.',
      },
    });
  }
}
