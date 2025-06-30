import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { jwtVerify } from 'jose';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer '))
      throw new UnauthorizedException('Falta token');

    const token = authHeader.split(' ')[1];
    try {
      const JWKS_URL = `${process.env.SUPABASE_URL}/auth/v1/keys`;
      const response = await fetch(JWKS_URL);
      const { keys } = await response.json();

      const key = await crypto.subtle.importKey(
        'jwk',
        keys[0], // usar la primera key del JWKS
        { name: 'RS256', hash: 'SHA-256' },
        false,
        ['verify'],
      );

      const { payload } = await jwtVerify(token, key);

      request.user = payload; // opcional: puedes añadirlo al req
      return true;
    } catch (err) {
      console.error(err);
      throw new UnauthorizedException('Token inválido');
    }
  }
}
