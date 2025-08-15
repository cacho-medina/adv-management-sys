import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { CreateBusinessDto } from '../business/dto/business.dto';
import { BusinessService } from '../business/business.service';
import { CreateProductsDto } from '../products/dto/create-product.dto';
import { ProductsService } from '../products/products.service';
import { CreateCategoriesDto } from '../categories/dto/create-category.dto';
import { CategoriesService } from '../categories/categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { EmailConfirmedGuard } from '../auth/guards/email-confirmed.guard';
import { BusinessAccess } from 'src/common/decorators/business-access.decorator';
import { BusinessAccessGuard } from '../auth/guards/business-access.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('onboarding')
@UseGuards(JwtAuthGuard, EmailConfirmedGuard)
export class OnboardingController {
  constructor(
    private readonly businessService: BusinessService,
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  @Post('create-business')
  createBusiness(
    @Req() req: any,
    @Body() createBusinessDto: CreateBusinessDto,
  ) {
    const { user } = req;
    return this.businessService.createBusiness(user.id, createBusinessDto);
  }
  @Post('/business/:businessId/create-products')
  @UseGuards(BusinessAccessGuard, RolesGuard)
  @BusinessAccess()
  @Roles(Role.ADMIN, Role.OWNER)
  createProducts(@Body() createProductsDto: CreateProductsDto) {
    return this.productsService.create(createProductsDto);
  }
  @Post('/business/:businessId/create-categories')
  @UseGuards(BusinessAccessGuard, RolesGuard)
  @BusinessAccess()
  @Roles(Role.ADMIN, Role.OWNER)
  createCategories(@Body() createCategoriesDto: CreateCategoriesDto) {
    return this.categoriesService.create(createCategoriesDto);
  }
}
