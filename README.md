# 🛡️ NestJS Auth Module con Google OAuth, Prisma y Verificación de Email

Este repositorio contiene un **AuthModule** listo para integrar autenticación con **Google**, **JWT**, verificación de correo y perfil de negocio en **NestJS** usando **Prisma** y **PostgreSQL**.

## ⚙️ 🏗️ Requisitos previos

Asegurate de tener tu proyecto NestJS iniciado y Prisma configurado:

```bash
nest new my-app
cd my-app
npm install prisma @prisma/client
npx prisma init

```

## 📦 Dependencias necesarias

Instalá todas las librerías necesarias con este comando:

```bash

npm install \
  @nestjs/passport passport passport-google-oauth20 \
  @nestjs/jwt @nestjs/config \
  @nestjs-modules/mailer nodemailer \
  class-validator class-transformer \
  prisma @prisma/client


```

## 🧰 Estructura recomendada de carpetas

```

src/
  main.ts
  app.module.ts
  auth/
    auth.module.ts
    auth.controller.ts
    auth.service.ts
    google.strategy.ts
    jwt.strategy.ts
    email-confirmed.guard.ts
    dto/
      oauth-login.dto.ts
      confirm-email.dto.ts
  common/
    constants/
      errors.constants.ts
    filters/
      all-exceptions.filter.ts
  prisma/
    schema.prisma
.env


```

## ⚙️ Ejemplo de archivo .env

```

# Google OAuth2
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/redirect

# JWT
JWT_SECRET=supersecreto
JWT_EXPIRES_IN=1h
JWT_VERIFICATION_SECRET=verificacionsecreta
JWT_VERIFICATION_EXPIRES_IN=1d

# SMTP para Mailer
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=usuarioSMTP
SMTP_PASS=claveSMTP
SMTP_FROM="No Reply" <noreply@tudominio.com>

# Prisma
DATABASE_URL=postgresql://usuario:password@localhost:5432/tu_db?schema=public


```

## 🤖 Cómo usar el prompt en Cursor AI

1. Asegurate de tener el proyecto configurado como se detalla arriba.

2. Abri Cursor AI y crea un nuevo prompt con este contenido:

```

Eres mi asistente experto en NestJS, Prisma y autenticación. Quiero que generes un módulo completo AuthModule con lo siguiente:
1. ...
2. ...
...
No agregues instrucciones sobre cómo correrlo o proponer cambios: genera directamente el código.


```

3. Esperá que Cursor genere los archivos del módulo (auth/), Prisma DTOs, migraciones y lógica completa.

4. Revisa, ajustá imports, ejecutá npx prisma migrate dev y npm run start:dev.

## 🧪 Comandos útiles

```bash

# Iniciar server de desarrollo
npm run start:dev

# Aplica migraciones y sincroniza Prisma
npx prisma migrate dev

# Generar cliente de Prisma si cambias el schema
npx prisma generate

# Ejecutar tests
npm test

# Once Router for OAuth Google
# - Navegá a http://localhost:3000/auth/google


```

## ✅ Flujo resumido del módulo

1. Usuario inicia sesión con Google → /auth/google.

2. Passport valida y pasa al servicio (validateOAuthLogin), que crea/actualiza usuario.

3. Se envía un token JWT y se envía correo de confirmación con token separado.

4. Usuario accede a /auth/confirm-email?token=... → isEmailConfirmed = true.

5. Se usa Guard (JwtAuthGuard, EmailConfirmedGuard) para proteger rutas.

6. El usuario crea su perfil de negocio vinculado a su ID en la base de datos.

## 🔄 Personalización y ampliación

- Editá errors.constants.ts para mensajes o códigos personalizados.

- Si necesitas flujos de negocio 1:N, modificá el modelo Profile.

- Añadí guardias extras, estrategias OAuth o lógica de negocio según tus requerimientos.
