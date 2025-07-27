import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO para la confirmación de email
 * Define la estructura de datos para verificar el email del usuario
 */
export class ConfirmEmailDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

/**
 * DTO para la respuesta de confirmación de email
 */
export class ConfirmEmailResponseDto {
  message: string;
  newUser: boolean;
  user: {
    id: string;
    email: string;
    isEmailVerified: boolean;
    token: string;
  };
  nextUrl: string;
}
