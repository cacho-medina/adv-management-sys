import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { CreateBusinessDto } from '../business/dto/business.dto';
import { BusinessService } from '../business/business.service';
import { CreateProductsDto } from '../products/dto/create-product.dto';
import { ProductsService } from '../products/products.service';
import { CreateCategoriesDto } from '../categories/dto/create-category.dto';
import { CategoriesService } from '../categories/categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { EmailConfirmedGuard } from '../auth/guards/email-confirmed.guard';

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
  @Post('create-products')
  createProducts(@Body() createProductsDto: CreateProductsDto) {
    return this.productsService.create(createProductsDto);
  }
  @Post('create-categories')
  createCategories(@Body() createCategoriesDto: CreateCategoriesDto) {
    return this.categoriesService.create(createCategoriesDto);
  }
}
