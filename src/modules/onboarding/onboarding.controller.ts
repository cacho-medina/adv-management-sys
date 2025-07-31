import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CompleteProfileDto } from '../user/dto/create-user.dto';
import { CreateBusinessDto } from '../business/dto/business.dto';
import { BusinessService } from '../business/business.service';
import { CreateProductsDto } from '../products/dto/create-product.dto';
import { ProductsService } from '../products/products.service';
import { CreateCategoriesDto } from '../categories/dto/create-category.dto';
import { CategoriesService } from '../categories/categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { EmailConfirmedGuard } from '../auth/guards/email-confirmed.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('onboarding')
@UseGuards(JwtAuthGuard, EmailConfirmedGuard, RolesGuard)
@Roles(Role.OWNER)
export class OnboardingController {
  constructor(
    private readonly userService: UserService,
    private readonly businessService: BusinessService,
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  @Post('complete-profile')
  createProfile(@Body() completeProfileDto: CompleteProfileDto) {
    const profile = this.userService.completeProfile(completeProfileDto);
    return {
      message: 'Profile completed successfully',
      next: `${process.env.FRONTEND_URL}/onboarding/business`,
    };
  }
  @Post('create-business')
  createBusiness(@Body() createBusinessDto: CreateBusinessDto) {
    const newBusiness = this.businessService.createBusiness(createBusinessDto);
    return {
      newBusiness,
      message: 'Business created successfully',
      next: `${process.env.FRONTEND_URL}/onboarding/profile`,
    };
  }
  @Post('create-products')
  createProducts(@Body() createProductsDto: CreateProductsDto) {
    const newProducts = this.productsService.create(createProductsDto);
    return {
      newProducts,
      message: 'Products created successfully',
      next: `${process.env.FRONTEND_URL}/dashboard/business`,
    };
  }
  @Post('create-categories')
  createCategories(@Body() createCategoriesDto: CreateCategoriesDto) {
    const newCategories = this.categoriesService.create(createCategoriesDto);
    return {
      newCategories,
      message: 'Categories created successfully',
      next: `${process.env.FRONTEND_URL}/onboarding/products`,
    };
  }
}
