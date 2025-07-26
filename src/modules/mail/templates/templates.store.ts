export const templates: Record<string, (ctx: any) => string> = {
  'test-email': (ctx) => {
    return `
    <h2>Hola ${ctx.name} 👋</h2>
<p>${ctx.message}</p>
<p><i>Este correo fue generado automáticamente por el sistema.</i></p>
    `;
  },
  'email-verification': (ctx) => {
    return `
    <html>
  <head>
    <meta charset='utf-8' />
    <title>Verifica tu email</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        background-color: #4caf50;
        color: white;
        padding: 20px;
        text-align: center;
        border-radius: 5px 5px 0 0;
      }
      .content {
        background-color: #f9f9f9;
        padding: 20px;
        border-radius: 0 0 5px 5px;
      }
      .button {
        display: inline-block;
        background-color: #4caf50;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 4px;
        margin: 20px 0;
      }
      .footer {
        text-align: center;
        margin-top: 20px;
        font-size: 12px;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class='header'>
      <h1>Verifica tu email</h1>
    </div>

    <div class='content'>
      <h2>Hola ${ctx.name},</h2>

      <p>Gracias por registrarte en nuestro sistema. Para completar tu registro,
        necesitamos verificar tu dirección de email.</p>

      <p>Haz clic en el botón de abajo para verificar tu email:</p>

      <div style='text-align: center;'>
        <a href='${ctx.verificationUrl}' class='button'>Verificar Email</a>
      </div>

      <p>Si el botón no funciona, puedes copiar y pegar este enlace en tu
        navegador:</p>
      <p style='word-break: break-all; color: #666;'>${ctx.verificationUrl}</p>

      <p>Este enlace expirará en 24 horas por razones de seguridad.</p>

      <p>Si no solicitaste este registro, puedes ignorar este email.</p>
    </div>

    <div class='footer'>
      <p>Este es un email automático, por favor no respondas a este mensaje.</p>
      <p>Si tienes alguna pregunta, contacta con nuestro equipo de soporte.</p>
    </div>
  </body>
</html>
    `;
  },
  'password-reset': (ctx) => {
    return `
    <html>
  <head>
    <meta charset='utf-8' />
    <title>Recuperación de contraseña</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        background-color: #4caf50;
        color: white;
        padding: 20px;
        text-align: center;
        border-radius: 5px 5px 0 0;
      }
      .content {
        background-color: #f9f9f9;
        padding: 20px;
        border-radius: 0 0 5px 5px;
      }
      .button {
        display: inline-block;
        background-color: #4caf50;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 4px;
        margin: 20px 0;
      }
      .footer {
        text-align: center;
        margin-top: 20px;
        font-size: 12px;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class='header'>
      <h1>Recuperación de contraseña</h1>
    </div>

    <div class='content'>
      <h2>Hola ${ctx.name},</h2>

      <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo para restablecer tu contraseña:</p>

      <p>Haz clic en el botón de abajo para restablecer tu contraseña:</p>

      <div style='text-align: center;'>
        <a href='${ctx.resetUrl}' class='button'>Restablecer contraseña</a>
      </div>

      <p>Si el botón no funciona, puedes copiar y pegar este enlace en tu
        navegador:</p>
      <p style='word-break: break-all; color: #666;'>${ctx.resetUrl}</p>

      <p>Este enlace expirará en 24 horas por razones de seguridad.</p>

      <p>Si no solicitaste este registro, puedes ignorar este email.</p>
    </div>

    <div class='footer'>
      <p>Este es un email automático, por favor no respondas a este mensaje.</p>
      <p>Si tienes alguna pregunta, contacta con nuestro equipo de soporte.</p>
    </div>
  </body>
</html>
    `;
  },
};
