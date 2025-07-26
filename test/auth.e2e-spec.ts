import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/modules/app/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    configService = moduleFixture.get<ConfigService>(ConfigService);

    await app.init();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Limpiar la base de datos antes de cada test
    await prismaService.user.deleteMany();
  });

  describe('/auth/google (GET)', () => {
    it('should redirect to Google OAuth', () => {
      return request(app.getHttpServer())
        .get('/auth/google')
        .expect(302) // Redirect
        .expect('Location', /accounts\.google\.com/);
    });
  });

  describe('/auth/confirm-email (POST)', () => {
    it('should confirm email with valid token', async () => {
      // Crear un usuario de prueba
      const user = await prismaService.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          provider: 'GOOGLE',
          providerId: 'google123',
          role: 'OWNER',
          isEmailVerified: false,
          emailVerificationToken: 'valid-token',
          emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        },
      });

      // Generar un token de verificación válido
      const verificationToken = jwtService.sign(
        {
          sub: user.id,
          type: 'email_verification',
        },
        {
          secret: configService.get<string>('jwt.verificationSecret'),
          expiresIn: configService.get<string>('jwt.verificationExpiresIn'),
        },
      );

      // Actualizar el token en la base de datos
      await prismaService.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: verificationToken,
        },
      });

      return request(app.getHttpServer())
        .post('/auth/confirm-email')
        .send({ token: verificationToken })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe('Email verificado exitosamente');
          expect(res.body.user.id).toBe(user.id);
          expect(res.body.user.email).toBe(user.email);
          expect(res.body.user.isEmailVerified).toBe(true);
        });
    });

    it('should reject invalid token', () => {
      return request(app.getHttpServer())
        .post('/auth/confirm-email')
        .send({ token: 'invalid-token' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Token de verificación inválido');
        });
    });

    it('should reject expired token', async () => {
      // Crear un usuario de prueba
      const user = await prismaService.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          provider: 'GOOGLE',
          providerId: 'google123',
          role: 'OWNER',
          isEmailVerified: false,
        },
      });

      // Generar un token expirado
      const expiredToken = jwtService.sign(
        {
          sub: user.id,
          type: 'email_verification',
          exp: Math.floor(Date.now() / 1000) - 3600, // Expiró hace 1 hora
        },
        {
          secret: configService.get<string>('jwt.verificationSecret'),
        },
      );

      return request(app.getHttpServer())
        .post('/auth/confirm-email')
        .send({ token: expiredToken })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Token expirado');
        });
    });
  });

  describe('/auth/profile (GET)', () => {
    it('should return user profile with valid JWT', async () => {
      // Crear un usuario de prueba
      const user = await prismaService.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          provider: 'GOOGLE',
          providerId: 'google123',
          role: 'OWNER',
          isEmailVerified: true,
        },
      });

      // Generar un token JWT válido
      const accessToken = jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
        {
          secret: configService.get<string>('jwt.secret'),
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      );

      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(user.id);
          expect(res.body.email).toBe(user.email);
          expect(res.body.name).toBe(user.name);
          expect(res.body.role).toBe(user.role);
          expect(res.body.isEmailVerified).toBe(user.isEmailVerified);
        });
    });

    it('should reject request without JWT', () => {
      return request(app.getHttpServer()).get('/auth/profile').expect(401);
    });

    it('should reject request with invalid JWT', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/auth/protected (GET)', () => {
    it('should allow access with verified email', async () => {
      // Crear un usuario de prueba con email verificado
      const user = await prismaService.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          provider: 'GOOGLE',
          providerId: 'google123',
          role: 'OWNER',
          isEmailVerified: true,
        },
      });

      // Generar un token JWT válido
      const accessToken = jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
        {
          secret: configService.get<string>('jwt.secret'),
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      );

      return request(app.getHttpServer())
        .get('/auth/protected')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Ruta protegida - Email verificado');
          expect(res.body.user.id).toBe(user.id);
        });
    });

    it('should reject access with unverified email', async () => {
      // Crear un usuario de prueba sin email verificado
      const user = await prismaService.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          provider: 'GOOGLE',
          providerId: 'google123',
          role: 'OWNER',
          isEmailVerified: false,
        },
      });

      // Generar un token JWT válido
      const accessToken = jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
        {
          secret: configService.get<string>('jwt.secret'),
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      );

      return request(app.getHttpServer())
        .get('/auth/protected')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toContain('El email no ha sido verificado');
        });
    });
  });
});
