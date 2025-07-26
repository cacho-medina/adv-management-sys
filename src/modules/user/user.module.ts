import JwtModuleConfig from 'src/config/jwt/jwt.config';
import { PrismaModule } from '../prisma/prisma.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule, JwtModuleConfig()],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
