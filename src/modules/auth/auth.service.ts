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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailerService: MailService,
    private userService: UserService,
  ) {}

  async login(credentials: LoginDto) {
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
    const token = await this.generateJwtToken(user);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    const profile = await this.prisma.profile.findUnique({
      where: { userId: user.id },
    });

    return { token, profile };
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
    const verificationUrl = `${process.env.FRONTEND_URL}/auth/confirm-email?token=${token}`;
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

  async confirmEmail(token: string): Promise<ConfirmEmailResponseDto> {
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

    const tokenLogin = await this.generateJwtToken(userUpdated);
    return {
      message: 'Email verificado correctamente',
      user: {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        token: tokenLogin,
      },
      newUser: true, //si es false el front restringe el acceso a la pagina de onboarding
      nextUrl: `${process.env.FRONTEND_URL}/onboarding/create-profile`,
    };
  }

  async generateJwtToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
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

  /**
   * Valida el login OAuth y crea/actualiza el usuario
   */
  /* async validateOAuthLogin(profile: any): Promise<any> {
    const { email, name, providerId } = profile;

    if (!email) {
      throw new BadRequestException(AUTH_ERRORS.OAUTH_EMAIL_REQUIRED.message);
    }

    // Buscar usuario existente por email o providerId
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { providerId, provider: AuthProvider.GOOGLE }],
      },
    });

    if (user) {
      // Actualizar usuario existente
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          lastLoginAt: new Date(),
          providerId,
          provider: AuthProvider.GOOGLE,
        },
      });
    } else {
      // Crear nuevo usuario
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          provider: AuthProvider.GOOGLE,
          providerId,
          role: Role.OWNER,
          isEmailVerified: false,
        },
      });

      // Enviar email de verificación para nuevos usuarios
      await this.sendVerificationEmail(user);
    }

    return user;
  } */

  /**
   * Procesa el login OAuth y retorna la respuesta completa
   */
  /* async processOAuthLogin(user: any): Promise<OAuthLoginResponseDto> {
    const accessToken = await this.generateJwtToken(user);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        provider: user.provider,
      },
      message: user.isEmailVerified
        ? 'Login exitoso'
        : 'Login exitoso. Por favor verifica tu email.',
    };
  } */

  /* private async createTokens(payload: JwtPayload) {
    return {
      accessToken: await this.jwtService.signAsync(
        payload,
        this.jwtConfig.access,
      ),
      refreshToken: await this.jwtService.signAsync(
        payload,
        this.jwtConfig.refresh,
      ),
    };
  } */
}
