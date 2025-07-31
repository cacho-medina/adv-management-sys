import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { Role, AuthProvider } from '@prisma/client';

export class CompleteProfileDto {
  userId: string;
  username: string;
  avatar: string;
  phone: string;
  secondaryEmail: string;
  description: string;
}

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
