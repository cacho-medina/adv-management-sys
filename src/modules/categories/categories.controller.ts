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
@UseGuards(JwtAuthGuard, EmailConfirmedGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Crear una nueva categoría
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  async create(
    @Body() createCategoryDto: CreateCategoriesDto,
    // @Req() req: any
  ): Promise<{ message: string; category: CategoryResponseDto }> {
    // const { user } = req;
    // return this.categoriesService.create(createCategoryDto, user.role, user.sub);

    // Temporal para testing - reemplazar con autenticación real
    return this.categoriesService.create(
      createCategoryDto,
      Role.ADMIN,
      'temp-user-id',
    );
  }

  /**
   * Obtener todas las categorías con filtros
   */
  @Get()
  async findAll(
    @Query('businessId', new ParseUUIDPipe({ optional: true }))
    businessId?: string,
    @Query('includeGlobal', new ParseBoolPipe({ optional: true }))
    includeGlobal: boolean = true,
    @Query('includeHierarchy', new ParseBoolPipe({ optional: true }))
    includeHierarchy: boolean = false,
  ): Promise<CategoryListResponseDto> {
    return this.categoriesService.findAll(
      businessId,
      includeGlobal,
      includeHierarchy,
    );
  }

  /**
   * Obtener solo categorías globales
   */
  @Public()
  @Get('global')
  async findGlobalCategories(): Promise<CategoryResponseDto[]> {
    return this.categoriesService.findGlobalCategories();
  }

  /**
   * Obtener categorías de un negocio específico
   */
  @Get('business/:businessId')
  @UseGuards(BusinessAccessGuard)
  @BusinessAccess()
  async findByBusiness(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query('includeGlobal', new ParseBoolPipe({ optional: true }))
    includeGlobal: boolean = true,
    // @Req() req: any
  ): Promise<CategoryResponseDto[]> {
    // const { user } = req;
    // return this.categoriesService.findByBusiness(businessId, user.sub, includeGlobal);

    // Temporal para testing
    return this.categoriesService.findByBusiness(
      businessId,
      'temp-user-id',
      includeGlobal,
    );
  }

  /**
   * Obtener una categoría específica
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    // @Req() req: any
  ): Promise<CategoryResponseDto> {
    // const { user } = req;
    // return this.categoriesService.findOne(id, user.sub, user.role);

    // Temporal para testing
    return this.categoriesService.findOne(id, 'temp-user-id', Role.ADMIN);
  }

  /**
   * Actualizar una categoría
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    // @Req() req: any
  ): Promise<{ message: string; category: CategoryResponseDto }> {
    // const { user } = req;
    // return this.categoriesService.update(id, updateCategoryDto, user.sub, user.role);

    // Temporal para testing
    return this.categoriesService.update(
      id,
      updateCategoryDto,
      'temp-user-id',
      Role.ADMIN,
    );
  }

  /**
   * Eliminar una categoría
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    // @Req() req: any
  ): Promise<{ message: string }> {
    // const { user } = req;
    // return this.categoriesService.remove(id, user.sub, user.role);

    // Temporal para testing
    return this.categoriesService.remove(id, 'temp-user-id', Role.ADMIN);
  }

  // Endpoints adicionales de utilidad

  /**
   * Obtener jerarquía completa de categorías
   */
  @Public()
  @Get('hierarchy/tree')
  async getCategoryTree(
    @Query('businessId', new ParseUUIDPipe({ optional: true }))
    businessId?: string,
  ): Promise<CategoryResponseDto[]> {
    const result = await this.categoriesService.findAll(businessId, true, true);
    // Filtrar solo categorías padre (sin parentId)
    return result.categories.filter((cat) => !cat.parentId);
  }

  /**
   * Obtener estadísticas de categorías
   */
  @Get('stats/summary')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  async getCategoryStats(
    @Query('businessId', new ParseUUIDPipe({ optional: true }))
    businessId?: string,
  ): Promise<{
    total: number;
    global: number;
    business: number;
    withProducts: number;
    withChildren: number;
  }> {
    const result = await this.categoriesService.findAll(businessId, true, true);

    return {
      total: result.total,
      global: result.globalCategories,
      business: result.businessCategories,
      withProducts: result.categories.filter(
        (cat) => cat.children && cat.children.length > 0,
      ).length,
      withChildren: result.categories.filter(
        (cat) => cat.children && cat.children.length > 0,
      ).length,
    };
  }
}
