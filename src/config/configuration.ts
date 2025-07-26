import * as Joi from 'joi';

export const envVaidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  PORT: Joi.number().port().default(4008),

  // Google OAuth2
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_SECRET_ID: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().required(),

  // JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  JWT_EMAIL_VERIFICATION_SECRET: Joi.string().min(32).required(),
  JWT_EMAIL_VERIFICATION_EXPIRES_IN: Joi.string().default('1d'),

  // SMTP para Mailer
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().port().required(),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),
  SMTP_FROM: Joi.string().email().required(),

  // Prisma
  DATABASE_URL: Joi.string().required(),
});

export interface Config {
  nodeEnv: string;
  port: number;
  google: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    verificationSecret: string;
    verificationExpiresIn: string;
  };
  smtp: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
  };
  database: {
    url: string;
  };
}

export const configuration = (): Config => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4008,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET_ID,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    verificationSecret: process.env.JWT_EMAIL_VERIFICATION_SECRET,
    verificationExpiresIn:
      process.env.JWT_EMAIL_VERIFICATION_EXPIRES_IN || '4h',
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
});
