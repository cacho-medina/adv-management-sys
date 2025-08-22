import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { User } from '@prisma/client';
import { AUTH_ERRORS } from '../../common/constants/errors.constants';
import { ConfirmEmailResponseDto } from './dto/confirm-email.dto';
import { CreateAccountDto, LoginDto } from './dto/create-auth.dto';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailerService: MailService,
    private userService: UserService,
  ) {}

  async login(credentials: LoginDto, res: Response) {
    const { email, password } = credentials;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS.message);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS.message);
    }
    if (!user.isEmailVerified) {
      throw new UnauthorizedException(AUTH_ERRORS.EMAIL_NOT_VERIFIED.message);
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    const profile = await this.prisma.profile.findUnique({
      where: { userId: user.id },
    });
    const access_token = await this.generateJwtToken(user);
    //const refresh_token = await this.generateJwtToken(user);

    return { access_token, profile };
  }

  async createAccount(createAccountDto: CreateAccountDto) {
    const { email, name, password, repeatPassword } = createAccountDto;
    if (password !== repeatPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }
    const userExist = await this.prisma.user.findUnique({ where: { email } });
    if (userExist) {
      throw new BadRequestException('El usuario ya existe');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userService.createUser({
      email,
      name,
      password: hashedPassword,
    });
    //generar token de verificacion y actualizar el usuario
    const token = randomUUID();
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationExpires: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 horas
      },
    });

    //enviar email de verificacion con la url (url+token) de verificacion
    try {
      await this.sendVerificationEmail(token, user);
    } catch (error) {
      throw new BadRequestException('Error al enviar el email de verificacion');
    }
    return {
      success: true,
      message: 'Cuenta creada correctamente, por favor verifica tu email',
    };
  }

  async sendVerificationEmail(token: string, user: User): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/auth/confirm-account?token=${token}`;

    await this.mailerService.sendTemplateMail({
      to: user.email,
      subject: 'Verifica tu email',
      template: 'email-verification',
      context: {
        name: user.name,
        verificationUrl,
        token,
      },
    });
  }

  async resendVerificationEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    console.log('user', user);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }
    if (user.isEmailVerified) {
      throw new BadRequestException('El email ya esta verificado');
    }
    const token = randomUUID();
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationExpires: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 horas
      },
    });
    try {
      await this.sendVerificationEmail(token, user);
    } catch (error) {
      throw new BadRequestException('Error al enviar el email de verificacion');
    }
    return {
      message: 'Email de verificación reenviado',
    };
  }

  async confirmEmail(
    token: string,
    res: Response,
  ): Promise<ConfirmEmailResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { gt: new Date() },
      },
    });
    if (!user) {
      throw new BadRequestException('Token de verificacion invalido');
    }
    /* REVISAR CONDICION DE EXPIRACION DEL TOKEN
     if (
      user.emailVerificationExpires &&
      user.emailVerificationExpires < new Date()
    ) {
      throw new BadRequestException(
        'Token de verificacion expirado. Por favor, solicita uno nuevo.',
      );
    } */
    const userUpdated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    //crear perfil si no existe
    const profile = await this.prisma.profile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) {
      await this.prisma.profile.create({
        data: {
          userId: user.id,
          username: user.email.split('@')[0],
          updatedAt: new Date(),
        },
      });
    }

    const access_token = await this.generateJwtToken(userUpdated);
    const refresh_token = await this.generateJwtToken(userUpdated);
    res.cookie('access_token', access_token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24, // 1 dia
    });
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
    });
    return {
      message: 'Email verificado correctamente',
      user: {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        access_token,
        refresh_token,
      },
      newUser: true, //si es false el front restringe el acceso a la pagina de onboarding
      nextUrl: `${process.env.FRONTEND_URL}/onboarding/create-profile`,
    };
  }

  async generateJwtToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
    });
  }

  async requestPasswordReset(email: string) {
    console.log('email', email);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Usuario no encontrado');

    const token = randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expires,
      },
    });

    // enviar correo
    try {
      await this.mailerService.sendTemplateMail({
        to: email,
        subject: 'Recuperación de contraseña',
        template: 'password-reset',
        context: {
          name: user.name,
          resetUrl: `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`,
        },
      });
    } catch (error) {
      throw new BadRequestException('Error al enviar el email de recuperación');
    }

    return { message: 'Correo de recuperación enviado' };
  }

  async resetPassword(
    token: string,
    newPassword: string,
    repeatPassword: string,
  ) {
    if (newPassword !== repeatPassword)
      throw new BadRequestException('Las contraseñas no coinciden');

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
      },
    });
    if (!user) throw new BadRequestException('Token inválido o expirado');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    //evaluar envio de email

    return { message: 'Contraseña actualizada correctamente' };
  }

  async validateOAuthLogin(user: any) {
    const { email, name, provider, providerId, picture } = user;

    // Buscar si el usuario ya existe por email
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (existingUser) {
      // Usuario existe - actualizar datos y loguear
      const updatedUser = await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          lastLoginAt: new Date(),
          provider: provider,
          providerId: providerId,
          name: name || existingUser.name,
          email: email,
        },
      });

      // Generar token de acceso
      const access_token = await this.generateJwtToken(updatedUser);

      return {
        access_token,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          isEmailVerified: updatedUser.isEmailVerified,
          provider: updatedUser.provider,
        },
        profile: existingUser.profile,
        newUser: false,
      };
    } else {
      // Usuario no existe - crear nuevo usuario y perfil
      const newUser = await this.prisma.user.create({
        data: {
          email,
          name,
          provider: provider,
          providerId: providerId,
          isEmailVerified: true, // OAuth users have verified emails
          password: null, // No password for OAuth users
        },
      });

      // Crear perfil para el nuevo usuario
      const newProfile = await this.prisma.profile.create({
        data: {
          userId: newUser.id,
          username: email.split('@')[0], // Generate username from email
          updatedAt: new Date(),
          avatar: picture || null,
        },
      });

      // Generar token de acceso
      const access_token = await this.generateJwtToken(newUser);

      return {
        access_token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          isEmailVerified: newUser.isEmailVerified,
          provider: newUser.provider,
        },
        profile: newProfile,
        newUser: true,
      };
    }
  }
}
