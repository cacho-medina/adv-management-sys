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
  Req,
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
import { DefaultValuePipe } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard, EmailConfirmedGuard, BusinessAccessGuard, RolesGuard)
@BusinessAccess()
@Roles(Role.ADMIN, Role.OWNER)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Crear un nuevo producto
   */
  @Post('/business/:businessId/new')
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
  @Roles(Role.OWNER, Role.ADMIN, Role.EMPLOYEE)
  async findAllByBusiness(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
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
  @Get('/business/:businessId/:id')
  @Roles(Role.OWNER, Role.ADMIN, Role.EMPLOYEE)
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
  @Patch('/business/:businessId/update/:id')
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
  @Delete('/business/:businessId/delete/:id')
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
  @Delete('/business/:businessId/permanent/:id')
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
  @Public()
  @Get('business/:businessId/featured')
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
