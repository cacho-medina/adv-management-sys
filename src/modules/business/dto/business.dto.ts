import {
  IsString,
  IsEmail,
  IsOptional,
  IsUrl,
  IsUUID,
  IsNotEmpty,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateBusinessDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  logo?: string;
}

export class UpdateBusinessDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  logo?: string;
}

export class InviteEmployeeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role = Role.EMPLOYEE;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  message?: string;
}

export class BusinessSettingsDto {
  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  dateFormat?: string;
}

// DTOs de respuesta
export class BusinessResponseDto {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  createdAt: Date;
  userRole?: Role;
  employeeCount?: number;
}

export class BusinessListResponseDto {
  businesses: BusinessResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class BusinessStatsDto {
  totalProducts: number;
  totalEmployees: number;
  totalSales: number;
  totalRevenue: number;
  activeProducts: number;
  categoriesCount: number;
  recentActivity: {
    productsAdded: number;
    salesMade: number;
    employeesJoined: number;
  };
}

export class EmployeeResponseDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  joinedAt: Date;
  isActive: boolean;
  avatar?: string;
}
