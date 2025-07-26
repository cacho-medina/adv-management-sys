import { Injectable } from '@nestjs/common';
import { transporter } from './mailer.config';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class MailService {
  private compileTemplate(templateName: string, context: any): string {
    const filePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
    const source = fs.readFileSync(filePath, 'utf-8');
    const compiled = Handlebars.compile(source);
    return compiled(context);
  }

  async verifyConnection(): Promise<void> {
    try {
      await transporter.verify();
      console.log('✅ SMTP conectado exitosamente');
    } catch (error) {
      console.error('❌ Error al conectar SMTP:', error);
    }
  }

  async sendTemplateMail({
    to,
    subject,
    template,
    context,
  }: {
    to: string;
    subject: string;
    template: string;
    context: any;
  }) {
    const html = this.compileTemplate(template, context);

    return transporter.sendMail({
      from: `"Soporte" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  }
}
