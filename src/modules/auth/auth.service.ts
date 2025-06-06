import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  CreateAuthDto,
  LoginDto,
} from './dto/create-auth.dto';
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async signup(createAuthDto: CreateAuthDto) {
    const { email, password, name, repeatPassword } = createAuthDto;

    if (password !== repeatPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      if (user) {
        throw new BadRequestException('User already exists');
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          provider: 'credentials',
        },
      });
      return {
        message: 'User created successfully',
        user,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid password');
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      return {
        message: 'Login successful',
        user,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    // Lógica para iniciar el proceso de recuperación de contraseña
    // Ejemplo: Enviar un correo electrónico con un enlace de restablecimiento
    return 'Forgot password email sent';
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // Lógica para restablecer la contraseña del usuario
    // Ejemplo: Actualizar la contraseña en la base de datos
    return 'Password reset successful';
  }
}
