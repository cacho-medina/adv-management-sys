import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { envVaidationSchema } from '../../config/configuration';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';
import { ProductsModule } from '../products/products.module';
import { CategoriesModule } from '../categories/categories.module';
import { BusinessModule } from '../business/business.module';
import { OnboardingModule } from '../onboarding/onboarding.module';
import { SalesModule } from '../sales/sales.module';

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
    ProductsModule,
    CategoriesModule,
    BusinessModule,
    OnboardingModule,
    SalesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
