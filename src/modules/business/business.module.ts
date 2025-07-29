import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
