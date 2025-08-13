import { NestApplication, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { GlobalAuthGuard } from './modules/auth/guards/global-auth.guard';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Aplicar guard global de autenticación
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new GlobalAuthGuard(reflector));

  // Configurar filtro de excepciones global
  app.useGlobalFilters(new AllExceptionsFilter());

  // Agregar middleware para cookies
  app.use(cookieParser());

  // Configurar CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });
  app.setGlobalPrefix('api/v1');
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('port') || 4008;
  const NODE_ENV = configService.get<string>('nodeEnv');

  await app.listen(PORT, () => {
    Logger.log(
      `🚀 Application running on port: http://localhost:${PORT}/api/v1`,
      NestApplication.name,
    );
    Logger.log(`🌍 Current environment: ${NODE_ENV}`, NestApplication.name);
    Logger.log(
      `🔐 Auth endpoints available at: http://localhost:${PORT}/api/v1/auth`,
      NestApplication.name,
    );
  });
}
bootstrap();
