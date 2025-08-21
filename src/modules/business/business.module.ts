import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BusinessController } from './business.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
