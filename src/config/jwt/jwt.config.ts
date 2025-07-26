import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

const JwtModuleConfig = async (): Promise<any> => {
  const options: any = {
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('jwt.secret'),
      signOptions: {
        expiresIn: configService.get<string>('jwt.expiresIn'),
      },
    }),
    inject: [ConfigService],
  };
  return JwtModule.registerAsync(options);
};

export default JwtModuleConfig;
