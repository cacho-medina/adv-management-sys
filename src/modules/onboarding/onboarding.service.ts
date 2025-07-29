import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProfileOnboardingDto } from './dto/create-onboarding.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}
  async createProfile(createProfileDto: CreateProfileOnboardingDto) {
    const { userId, username, avatar, phone, secondaryEmail, description } =
      createProfileDto;
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
      nextUrl: `${process.env.FRONTEND_URL}/onboarding/create-business`,
    };
  }
}
