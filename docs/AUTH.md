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

Eres mi asistente experto en NestJS, Prisma y autenticación. Quiero que generes un **módulo completo `AuthModule`** con lo siguiente:

1. **Estructura y dependencias**: /auth: auth.module, auth.service, auth.controller; /strategies: google, jwt; guards: JwtAuthGuard, EmailConfirmedGuard; /dto.
2. **Google OAuth** con Passport:
   - `passport-google-oauth20`
   - Ruta `/auth/google`, `/auth/google/redirect`
   - Validación e inserción/actualización del usuario en DB.
3. **JWT**:
   - `@nestjs/jwt` para tokens `access_token`
   - `JwtStrategy` para validar rutas protegidas.
4. **Prisma Schema**:
   - Revisa el modelo User para utilizar las propiedades correctas
5. **Confirmación de correo**:
   - Campo `isEmailVerified`
   - Token JWT de confirmación con expiración
   - Endpoint `POST /auth/confirm-email`
   - `EmailConfirmedGuard` que bloquea rutas si no está confirmado.
6. **Manejo de errores y constantes**:
   - Usa `HttpExceptions` con constantes (importadas desde `errors.constants.ts`)
7. **Tests**:
   - Crea un test unitario básico para `AuthService.validateOAuthLogin`.
   - Crea un e2e test para flujo Google OAuth redirigiendo y validando token.
8. **Configuración**:
   - Usa `@nestjs/config` para variables de entorno (`GOOGLE_CLIENT_ID`, `JWT_SECRET`, SMTP, etc.).
   - `MailerModule` configurado con nodemailer para envío de confirmación.
9. **Estilo de código**:
   - Usa TypeScript, formato limpio, DTOs, validaciones con `class-validator`.
   - Código modular, bien estructurado, con comentario breve por clase.
10. **Resúmenes**:
    - Al inicio del módulo, incluye un comentario explicando el flujo completo.
    - En cada archivo explica su propósito.

No agregues instrucciones sobre cómo correrlo o proponer cambios: genera directamente el código estructurado de la forma que escribirías en un repo producido profesionalmente.


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

---

## Guards Implementation

## Resumen de Implementación

### Ubicación de Guards y Decoradores:

1. 1. Guards de Autenticación:

   - JwtAuthGuard : Todos los endpoints protegidos
   - EmailConfirmedGuard : Endpoints que requieren email verificado
   - GlobalAuthGuard : Aplicado globalmente en main.ts

2. 2. Guards de Autorización:

   - RolesGuard : Endpoints con control de roles específicos
   - BusinessAccessGuard : Endpoints que requieren acceso a un negocio específico

3. 3. Decoradores:

   - @Public() : Endpoints públicos (auth, categorías globales)
   - @Roles() : Especificar roles requeridos
   - @BusinessAccess() : Marcar endpoints que requieren acceso a negocio
   - @CurrentUser() : Inyectar usuario actual

### Niveles de Seguridad por Módulo:

- 🔓 Público : Auth endpoints, categorías globales, jerarquía
- 🔒 Autenticado : Perfil de usuario, listados básicos
- 🔐 Email Verificado : Operaciones de negocio
- 👑 Roles Específicos : Creación, modificación, eliminación
- 🏢 Acceso a Negocio : Operaciones específicas por negocio

### Próximos Pasos:

1. 1. Actualizar módulos para exportar los nuevos guards
2. 2. Implementar middleware de logging de accesos
3. 3. Agregar rate limiting para endpoints públicos
4. 4. Configurar CORS apropiadamente
5. 5. Implementar refresh tokens para mayor seguridad
