import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, CreateOwnerDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /* async getUsers() {
    return this.prisma.user.findMany();
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        userBusinesses: {
          include: {
            business: true,
          },
        },
      },
    });
  } */

  /* async createEmployee(newEmployee: CreateEmployeeDto) {
    // Verificar si el empleado ya existe
    const userExist = await this.prisma.user.findUnique({
      where: { email: newEmployee.email },
    });
    if (userExist) {
      throw new BadRequestException('Employee already exists');
    }

    // Verificar si el negocio existe
    const businessExist = await this.prisma.business.findUnique({
      where: { id: newEmployee.businessId },
    });
    if (!businessExist) {
      throw new NotFoundException('Business not found');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(newEmployee.password, 10);

    // Crear usuario, perfil y asociación con negocio en una transacción
    const result = await this.prisma.$transaction(async (prisma) => {
      // Crear el usuario
      const user = await prisma.user.create({
        data: {
          email: newEmployee.email,
          name: newEmployee.name,
          password: hashedPassword,
          role: 'EMPLOYEE',
          provider: 'CREDENTIALS',
          providerId: null,
        },
      });

      // Crear el perfil
      const profile = await prisma.profile.create({
        data: {
          username:
            newEmployee.username ||
            newEmployee.name.trim().toLowerCase().replace(/\s+/g, '_'),
          phone: newEmployee.phone || null,
          secondaryEmail: newEmployee.secondaryEmail || null,
          description: newEmployee.description || null,
          userId: user.id,
          isActive: true,
        },
      });

      // Crear la asociación con el negocio
      const userBusiness = await prisma.userBusiness.create({
        data: {
          userId: user.id,
          businessId: newEmployee.businessId,
          role: 'EMPLOYEE',
          isEmployee: true,
        },
      });

      return {
        user,
        profile,
        userBusiness,
      };
    });

    return {
      user: result.user,
      profile: result.profile,
      businessAssociation: result.userBusiness,
      message: 'Employee created successfully for business',
    };
  } */

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

  //la creacion del perfil es optativa luego de verificar el email
  async createOwnerProfile(newOwner: CreateOwnerDto) {
    const { userId, username, avatarUrl, phone, secondaryEmail, description } =
      newOwner;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }
    const profile = await this.prisma.profile.create({
      data: {
        username:
          username || user.name.trim().toLowerCase().replace(/\s+/g, '_'),
        avatar: avatarUrl || null,
        phone: phone || null,
        secondaryEmail: secondaryEmail || null,
        description: description || null,
        user: { connect: { id: userId } },
      },
    });
    if (!profile) {
      throw new BadRequestException('Error al crear el perfil');
    }
    return {
      message: 'Perfil creado correctamente',
      profile,
    };
  }

  /* async updateUser(id: string, user: User) {
    return this.prisma.user.update({
      where: { id },
      data: user,
    });
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  } */
}
