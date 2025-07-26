# 🔧 Configuración del Módulo de Autenticación

## Variables de Entorno Requeridas

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Environment
NODE_ENV=development
PORT=3000

# Google OAuth2
GOOGLE_CLIENT_ID=tu_client_id_de_google
GOOGLE_CLIENT_SECRET=tu_client_secret_de_google
GOOGLE_CALLBACK_URL=http://localhost:4004/auth/google/redirect

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro_de_al_menos_32_caracteres
JWT_EXPIRES_IN=1h
JWT_VERIFICATION_SECRET=tu_verification_secret_super_seguro_de_al_menos_32_caracteres
JWT_VERIFICATION_EXPIRES_IN=1d

# SMTP para Mailer
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=tu_usuario_smtp
SMTP_PASS=tu_clave_smtp
SMTP_FROM="No Reply" <noreply@tudominio.com>

# Prisma
DATABASE_URL=postgresql://usuario:password@localhost:5432/tu_db?schema=public

# Frontend URL (opcional)
FRONTEND_URL=http://localhost:3000
```

## Configuración de Google OAuth2

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+
4. Ve a "Credentials" y crea un "OAuth 2.0 Client ID"
5. Configura las URIs de redirección autorizadas:
   - `http://localhost:4004/auth/google/redirect` (desarrollo)
   - `https://tudominio.com/auth/google/redirect` (producción)

## Configuración de SMTP

Para desarrollo, puedes usar servicios como:

- **Mailtrap**: Para testing
- **Gmail**: Con autenticación de 2 factores
- **SendGrid**: Para producción

## Comandos de Inicialización

```bash
# Instalar dependencias
npm install

# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Iniciar servidor de desarrollo
npm run start:dev
```

## Endpoints Disponibles

- `GET /auth/google` - Inicia el flujo de autenticación con Google
- `GET /auth/google/redirect` - Callback de Google OAuth
- `POST /auth/confirm-email` - Confirma el email del usuario
- `GET /auth/profile` - Obtiene el perfil del usuario (requiere JWT)
- `GET /auth/protected` - Ruta protegida (requiere JWT + email verificado)
- `POST /auth/resend-verification` - Reenvía email de verificación

## Flujo de Autenticación

1. Usuario visita `/auth/google`
2. Es redirigido a Google para autenticación
3. Google redirige de vuelta a `/auth/google/redirect`
4. Se crea/actualiza el usuario en la base de datos
5. Se envía email de verificación (si es nuevo usuario)
6. Se redirige al frontend con el token JWT
7. Usuario confirma su email visitando el enlace del email
8. Usuario puede acceder a rutas protegidas
