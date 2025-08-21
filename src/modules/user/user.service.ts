import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompleteProfileDto, CreateUserDto } from './dto/create-user.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(newUser: CreateUserDto) {
    const { email, name, password } = newUser;
    const user = await this.prisma.user.create({
      data: { email, name, password, provider: 'CREDENTIALS' },
    });
    if (!user) {
      throw new BadRequestException('Error al crear el usuario');
    }
    return user;
  }
  async completeProfile(userId: string, profileDto: CompleteProfileDto) {
    const { username, avatar, phone, secondaryEmail, description } = profileDto;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }
    //crear servicio para subir imagen a cloudinary
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        username,
        avatar,
        phone,
        secondaryEmail,
        description,
      },
    });
    return {
      message: 'Perfil actualizado correctamente',
      profile: profile.username,
    };
  }

  async changePassword(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        password,
      },
    });
    return {
      message: 'Contraseña cambiada correctamente',
    };
  }
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    return {
      email: user.email,
      name: user.name,
      username: user.profile.username,
      avatar: user.profile.avatar,
      phone: user.profile.phone,
      secondaryEmail: user.profile.secondaryEmail,
      description: user.profile.description,
      createdAt: user.registeredAt,
      updatedAt: user.profile.updatedAt,
      isEmailVerified: user.isEmailVerified,
      lastLogin: user.lastLoginAt,
    };
  }

  async acceptInvitation(
    userId: string,
    acceptInvitationDto: AcceptInvitationDto,
  ): Promise<{ message: string; business?: any }> {
    const { token } = acceptInvitationDto;

    // Buscar la invitación por token
    const invitation = await this.prisma.businessInvitations.findUnique({
      where: { token },
      include: {
        business: true,
        invitedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitación no encontrada o token inválido');
    }

    // Verificar si la invitación ya fue usada
    if (invitation.isUsed) {
      throw new BadRequestException('Esta invitación ya ha sido utilizada');
    }

    // Verificar si la invitación ha expirado
    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Esta invitación ha expirado');
    }

    // Obtener el usuario autenticado
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que el email del usuario coincida con el de la invitación
    if (user.email !== invitation.email) {
      throw new BadRequestException(
        'Esta invitación no corresponde a tu email',
      );
    }

    // Verificar si el usuario ya es empleado del negocio
    const existingEmployee = await this.prisma.userBusiness.findUnique({
      where: {
        userId_businessId: {
          userId,
          businessId: invitation.businessId,
        },
      },
    });

    if (existingEmployee) {
      throw new BadRequestException('Ya eres empleado de este negocio');
    }

    // Usar transacción para asegurar consistencia
    const result = await this.prisma.$transaction(async (prisma) => {
      // Crear la relación UserBusiness
      await prisma.userBusiness.create({
        data: {
          userId,
          businessId: invitation.businessId,
          role: invitation.role,
        },
      });

      // Marcar la invitación como usada
      await prisma.businessInvitations.update({
        where: { id: invitation.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
          acceptedById: userId,
        },
      });

      return invitation.business;
    });

    return {
      message: `Te has unido exitosamente a ${result.name}`,
      business: {
        id: result.id,
        name: result.name,
        role: invitation.role,
      },
    };
  }
}
