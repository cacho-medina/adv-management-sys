import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AUTH_ERRORS } from '../../../common/constants/errors.constants';

/**
 * Guard para verificar que el email esté confirmado
 * Bloquea el acceso si el usuario no ha verificado su email
 */
@Injectable()
export class EmailConfirmedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException(AUTH_ERRORS.INVALID_CREDENTIALS.message);
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenException(AUTH_ERRORS.EMAIL_NOT_VERIFIED.message);
    }

    return true;
  }
}
