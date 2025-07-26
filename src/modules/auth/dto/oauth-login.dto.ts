import { IsString, IsOptional, IsEnum } from 'class-validator';
import { AuthProvider } from '@prisma/client';

/**
 * DTO para el login OAuth
 * Define la estructura de datos para el flujo de autenticación OAuth
 */
export class OAuthLoginDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsEnum(AuthProvider)
  @IsOptional()
  provider?: AuthProvider;
}

/**
 * DTO para la respuesta del login OAuth
 */
export class OAuthLoginResponseDto {
  access_token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
    isEmailVerified: boolean;
    provider: string;
  };
  message?: string;
}
