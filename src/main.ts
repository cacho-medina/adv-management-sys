import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

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

  // Configurar filtro de excepciones global
  app.useGlobalFilters(new AllExceptionsFilter());

  // Configurar CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  const configService = app.get(ConfigService);
  console.log(configService.get<string>('jwt.secret'));
  const PORT = configService.get<number>('port') || 4004;
  const NODE_ENV = configService.get<string>('nodeEnv');

  await app.listen(PORT, () => {
    Logger.log(
      `🚀 Application running on port: http://localhost:${PORT}`,
      NestApplication.name,
    );
    Logger.log(`🌍 Current environment: ${NODE_ENV}`, NestApplication.name);
    Logger.log(
      `🔐 Auth endpoints available at: http://localhost:${PORT}/auth`,
      NestApplication.name,
    );
  });
}
bootstrap();
