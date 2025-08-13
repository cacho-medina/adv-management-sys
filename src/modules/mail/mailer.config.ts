import * as nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // ✅ Agregar configuraciones de timeout
  /* connectionTimeout: 60000, // 60 segundos
  greetingTimeout: 30000,    // 30 segundos
  socketTimeout: 60000,      // 60 segundos */
});
