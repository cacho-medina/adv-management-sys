import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SupabaseStrategy } from './strategies/supabase.strategy';
import { JwtAuthGuard } from './guards/jwt.auth.guard';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          global: true,
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: '40000' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [JwtAuthGuard, SupabaseStrategy],
  controllers: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
