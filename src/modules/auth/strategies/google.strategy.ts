import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

/**
 * Estrategia de Google OAuth para Passport
 * Maneja la autenticación con Google OAuth 2.0
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_SECRET_ID'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { emails, photos, displayName, id, provider } = profile;

      // Validar que el email existe
      if (!emails || !emails[0] || !emails[0].value) {
        console.error('No email found in Google profile');
        return done(
          new Error('No se pudo obtener el email del perfil de Google'),
          null,
        );
      }

      // Limpiar la URL de la foto si existe
      let cleanPictureUrl = null;
      if (photos && photos[0] && photos[0].value) {
        cleanPictureUrl = photos[0].value.trim(); // Eliminar espacios
        // Reemplazar caracteres escapados
        cleanPictureUrl = cleanPictureUrl.replace(/\\u003d/g, '=');
      }

      const user = {
        email: emails[0].value.trim(),
        name: displayName,
        picture: cleanPictureUrl,
        accessToken,
        provider: 'GOOGLE',
        providerId: id,
      };

      const validatedUser = await this.authService.validateOAuthLogin(user);
      done(null, validatedUser);
    } catch (error) {
      console.error('Error in GoogleStrategy validate:', error);
      console.error('Error stack:', error.stack);
      done(error, null);
    }
  }
}
