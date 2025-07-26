import { Injectable } from '@nestjs/common';
import { transporter } from './mailer.config';
import { templates } from './templates/templates.store';

@Injectable()
export class MailService {
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
    const html = templates[template](context);

    try {
      transporter.sendMail({
        from: `"Soporte" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
      return {
        message: 'Correo enviado correctamente',
      };
    } catch (error) {
      throw new Error('Error al enviar el correo');
    }
  }
}
