import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import JwtModuleConfig from '../../config/jwt/jwt.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    JwtModuleConfig(),
    PassportModule,
    UserModule,
    PrismaModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
