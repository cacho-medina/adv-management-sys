import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard JWT para proteger rutas
 * Verifica que el usuario esté autenticado mediante JWT
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
