import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateProfileOnboardingDto,
  CreateBusinessOnboardingDto,
  CreateCategoriesOnboardingDto,
  CreateProductsOnboardingDto,
} from './dto/create-onboarding.dto';
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

  //mover servicio a modulo Business
  async createBusiness(createBusinessDto: CreateBusinessOnboardingDto) {
    const { userId, name, description, address, phone, email, website, logo } =
      createBusinessDto;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }
    const business = await this.prisma.business.create({
      data: {
        name,
        description,
        address,
        phone,
        email,
        website,
        logo,
      },
    });
    await this.prisma.userBusiness.create({
      data: {
        userId,
        businessId: business.id,
        role: 'OWNER',
      },
    });
    return {
      message: 'Negocio creado correctamente',
      business: business.name,
    };
  }
}
