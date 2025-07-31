import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { BUSINESS_ACCESS_KEY } from '../../../common/decorators/business-access.decorator';
import { AUTH_ERRORS } from '../../../common/constants/errors.constants';

@Injectable()
export class BusinessAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiresBusinessAccess = this.reflector.getAllAndOverride<boolean>(
      BUSINESS_ACCESS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiresBusinessAccess) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const businessId = request.params.businessId;

    if (!businessId) {
      throw new BadRequestException('Business ID is required');
    }

    if (!user) {
      throw new ForbiddenException(AUTH_ERRORS.INVALID_CREDENTIALS.message);
    }

    // Verificar si el usuario tiene acceso al negocio
    const userBusiness = await this.prisma.userBusiness.findUnique({
      where: {
        userId_businessId: {
          userId: user.id,
          businessId: businessId,
        },
      },
    });

    if (!userBusiness) {
      throw new ForbiddenException('No tienes acceso a este negocio');
    }

    // Agregar información del negocio al request
    request.userBusiness = userBusiness;
    return true;
  }
}
