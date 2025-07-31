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
  ParseIntPipe,
  ParseBoolPipe,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductsDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ProductResponseDto,
  ProductListResponseDto,
} from './dto/product-response.dto';
import { EmailConfirmedGuard } from '../auth/guards/email-confirmed.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { BusinessAccess } from 'src/common/decorators/business-access.decorator';
import { BusinessAccessGuard } from '../auth/guards/business-access.guard';

@Controller('products')
@UseGuards(JwtAuthGuard, EmailConfirmedGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Crear un nuevo producto
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN, Role.EMPLOYEE)
  async create(
    @Body() createProductDto: CreateProductsDto,
  ): Promise<{ message: string; product: ProductResponseDto }> {
    return this.productsService.create(createProductDto);
  }

  /**
   * Obtener productos por negocio con filtros y paginación
   */
  @Get('business/:businessId')
  @UseGuards(BusinessAccessGuard)
  @BusinessAccess()
  async findAllByBusiness(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('search') search?: string,
    @Query('categoryId', new ParseUUIDPipe({ optional: true }))
    categoryId?: string,
    @Query('isActive', new ParseBoolPipe({ optional: true }))
    isActive?: boolean,
  ): Promise<ProductListResponseDto> {
    return this.productsService.findAllByBusiness(
      businessId,
      page,
      limit,
      search,
      categoryId,
      isActive,
    );
  }

  /**
   * Obtener un producto específico
   */
  @Get(':id/business/:businessId')
  @UseGuards(BusinessAccessGuard)
  @BusinessAccess()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('businessId', ParseUUIDPipe) businessId: string,
  ): Promise<ProductResponseDto> {
    return this.productsService.findOne(id, businessId);
  }

  /**
   * Actualizar un producto
   */
  @Patch(':id/business/:businessId')
  @UseGuards(BusinessAccessGuard, RolesGuard)
  @BusinessAccess()
  @Roles(Role.OWNER, Role.ADMIN, Role.EMPLOYEE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<{ message: string; product: ProductResponseDto }> {
    return this.productsService.update(id, businessId, updateProductDto);
  }

  /**
   * Eliminar un producto (soft delete)
   */
  @Delete(':id/business/:businessId')
  @UseGuards(BusinessAccessGuard, RolesGuard)
  @BusinessAccess()
  @Roles(Role.OWNER, Role.ADMIN)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('businessId', ParseUUIDPipe) businessId: string,
  ): Promise<{ message: string }> {
    return this.productsService.remove(id, businessId);
  }

  /**
   * Eliminar permanentemente un producto
   */
  @Delete(':id/business/:businessId/permanent')
  @UseGuards(BusinessAccessGuard, RolesGuard)
  @BusinessAccess()
  @Roles(Role.OWNER)
  async hardDelete(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('businessId', ParseUUIDPipe) businessId: string,
  ): Promise<{ message: string }> {
    return this.productsService.hardDelete(id, businessId);
  }

  // Endpoints adicionales de utilidad

  /**
   * Obtener productos destacados
   */
  @Get('business/:businessId/featured')
  @UseGuards(BusinessAccessGuard, RolesGuard)
  @BusinessAccess()
  @Roles(Role.OWNER, Role.ADMIN)
  async getFeaturedProducts(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 5,
  ): Promise<ProductListResponseDto> {
    return this.productsService.findAllByBusiness(
      businessId,
      1,
      limit,
      undefined,
      undefined,
      true,
    );
  }

  /**
   * Obtener productos con stock bajo
   */
  @Get('business/:businessId/low-stock')
  @UseGuards(BusinessAccessGuard, RolesGuard)
  @BusinessAccess()
  @Roles(Role.OWNER, Role.ADMIN)
  async getLowStockProducts(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query('threshold', new ParseIntPipe({ optional: true }))
    threshold: number = 10,
  ): Promise<ProductResponseDto[]> {
    // Este método necesitaría implementarse en el service
    // return this.productsService.findLowStockProducts(businessId, threshold);
    return [];
  }
}
