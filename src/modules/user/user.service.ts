import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompleteProfileDto, CreateUserDto } from './dto/create-user.dto';

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
}
