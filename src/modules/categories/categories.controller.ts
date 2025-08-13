import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  ParseBoolPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoriesDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  CategoryResponseDto,
  CategoryListResponseDto,
} from './dto/category-response.dto';
import { Role } from '@prisma/client';
import { EmailConfirmedGuard } from '../auth/guards/email-confirmed.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { BusinessAccessGuard } from '../auth/guards/business-access.guard';
import { BusinessAccess } from 'src/common/decorators/business-access.decorator';

@Controller('categories')
@UseGuards(JwtAuthGuard, EmailConfirmedGuard, BusinessAccessGuard, RolesGuard)
@BusinessAccess()
@Roles(Role.ADMIN, Role.OWNER)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Crear una nueva categoría
   */
  @Post('/business/:businessId/new')
  async create(
    @Body() createCategoryDto: CreateCategoriesDto,
  ): Promise<{ message: string; category: CategoryResponseDto }> {
    return this.categoriesService.create(createCategoryDto);
  }

  /**
   * Obtener todas las categorías con filtros
   */
  @Get()
  async findAll(
    @Query('businessId', new ParseUUIDPipe({ optional: true }))
    businessId?: string,
    @Query('includeHierarchy', new ParseBoolPipe({ optional: true }))
    includeHierarchy: boolean = false,
  ): Promise<CategoryListResponseDto> {
    return this.categoriesService.findAll(businessId, includeHierarchy);
  }

  /**
   * Obtener categorías de un negocio específico
   */
  @Get('business/:businessId')
  @Roles(Role.OWNER, Role.ADMIN, Role.EMPLOYEE)
  async findByBusiness(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query('includeHierarchy', new ParseBoolPipe({ optional: true }))
    includeHierarchy: boolean = false,
  ): Promise<CategoryResponseDto[]> {
    return this.categoriesService.findByBusiness(businessId, includeHierarchy);
  }

  /**
   * Obtener una categoría específica
   */
  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.EMPLOYEE)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.findOne(id);
  }

  /**
   * Actualizar una categoría
   */
  @Patch('/business/:businessId/update/:id')
  async update(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<{ message: string; category: CategoryResponseDto }> {
    return this.categoriesService.update(businessId, id, updateCategoryDto);
  }

  /**
   * Eliminar una categoría
   */
  @Delete('/business/:businessId/delete/:id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    return this.categoriesService.remove(id);
  }
}
