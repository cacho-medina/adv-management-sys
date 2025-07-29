import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessDto } from './dto/business.dto';

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  async createBusiness(createBusinessDto: CreateBusinessDto) {
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
