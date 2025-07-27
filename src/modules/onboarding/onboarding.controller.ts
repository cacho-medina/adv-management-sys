import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import {
  CreateProfileOnboardingDto,
  CreateBusinessOnboardingDto,
  CreateCategoriesOnboardingDto,
  CreateProductsOnboardingDto,
} from './dto/create-onboarding.dto';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('complete-profile')
  createProfile(@Body() createProfileDto: CreateProfileOnboardingDto) {
    return this.onboardingService.createProfile(createProfileDto);
  }
  @Post('create-business')
  createBusiness(@Body() createBusinessDto: CreateBusinessOnboardingDto) {
    return this.onboardingService.createBusiness(createBusinessDto);
  }
  @Post('create-categories')
  createCategories(@Body() createCategoriesDto: CreateCategoriesOnboardingDto) {
    return this.onboardingService.createCategories(createCategoriesDto);
  }
  @Post('create-products')
  createProducts(@Body() createProductsDto: CreateProductsOnboardingDto) {
    return this.onboardingService.createProducts(createProductsDto);
  }
}
