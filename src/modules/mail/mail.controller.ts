import { Controller, Get, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}
  @Public()
  @Get('verify-connection')
  async verifyConnection() {
    return this.mailService.verifyConnection();
  }
  @Public()
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
