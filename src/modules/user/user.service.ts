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
      message: 'Perfil creado correctamente',
      profile: profile.username,
    };
  }
}
