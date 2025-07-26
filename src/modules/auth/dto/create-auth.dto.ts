import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateAccountDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  password: string;
  @IsString()
  @IsNotEmpty()
  repeatPassword: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  password: string;
}
export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string; // Token de restablecimiento de contraseña
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
