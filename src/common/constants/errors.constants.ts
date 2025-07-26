/**
 * Constantes de errores para el módulo de autenticación
 * Centraliza todos los mensajes y códigos de error relacionados con auth
 */

export const AUTH_ERRORS = {
  // Errores de OAuth
  OAUTH_PROVIDER_NOT_SUPPORTED: {
    code: 'OAUTH_PROVIDER_NOT_SUPPORTED',
    message: 'Proveedor OAuth no soportado',
    statusCode: 400,
  },
  OAUTH_PROFILE_NOT_FOUND: {
    code: 'OAUTH_PROFILE_NOT_FOUND',
    message: 'No se pudo obtener el perfil de OAuth',
    statusCode: 400,
  },
  OAUTH_EMAIL_REQUIRED: {
    code: 'OAUTH_EMAIL_REQUIRED',
    message: 'El email es requerido para el registro con OAuth',
    statusCode: 400,
  },

  // Errores de JWT
  INVALID_TOKEN: {
    code: 'INVALID_TOKEN',
    message: 'Token inválido o expirado',
    statusCode: 401,
  },
  TOKEN_EXPIRED: {
    code: 'TOKEN_EXPIRED',
    message: 'Token expirado',
    statusCode: 401,
  },
  TOKEN_MALFORMED: {
    code: 'TOKEN_MALFORMED',
    message: 'Token malformado',
    statusCode: 401,
  },

  // Errores de verificación de email
  EMAIL_NOT_VERIFIED: {
    code: 'EMAIL_NOT_VERIFIED',
    message: 'El email no ha sido verificado',
    statusCode: 403,
  },
  INVALID_VERIFICATION_TOKEN: {
    code: 'INVALID_VERIFICATION_TOKEN',
    message: 'Token de verificación inválido o expirado',
    statusCode: 400,
  },
  EMAIL_ALREADY_VERIFIED: {
    code: 'EMAIL_ALREADY_VERIFIED',
    message: 'El email ya ha sido verificado',
    statusCode: 400,
  },

  // Errores de usuario
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: 'Usuario no encontrado',
    statusCode: 404,
  },
  USER_ALREADY_EXISTS: {
    code: 'USER_ALREADY_EXISTS',
    message: 'El usuario ya existe',
    statusCode: 409,
  },
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    message: 'Credenciales inválidas',
    statusCode: 401,
  },

  // Errores de configuración
  MISSING_OAUTH_CONFIG: {
    code: 'MISSING_OAUTH_CONFIG',
    message: 'Configuración de OAuth incompleta',
    statusCode: 500,
  },
  MISSING_JWT_CONFIG: {
    code: 'MISSING_JWT_CONFIG',
    message: 'Configuración de JWT incompleta',
    statusCode: 500,
  },
  MISSING_SMTP_CONFIG: {
    code: 'MISSING_SMTP_CONFIG',
    message: 'Configuración de SMTP incompleta',
    statusCode: 500,
  },
} as const;

export type AuthErrorCode = keyof typeof AUTH_ERRORS;
