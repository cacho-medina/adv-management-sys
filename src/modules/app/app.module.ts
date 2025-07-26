import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { envVaidationSchema } from '../../config/configuration';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envVaidationSchema,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    MailModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
