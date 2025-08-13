import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('role', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    // Obtener businessId del cuerpo de la solicitud o parámetros
    const businessId = request.body?.businessId || request.params?.businessId;

    if (!businessId) {
      console.log('❌ BusinessId no encontrado para verificar roles');
      return false;
    }

    // Buscar el rol del usuario en este negocio específico
    const userBusiness = await this.prisma.userBusiness.findFirst({
      where: {
        userId: user.id,
        businessId: businessId,
      },
    });

    if (!userBusiness) {
      console.log('❌ Usuario no tiene acceso a este negocio');
      return false;
    }

    return requiredRoles.includes(userBusiness.role);
  }
}
