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
import { CreateProfileOnboardingDto } from './dto/create-onboarding.dto';
import { CreateBusinessDto } from '../business/dto/business.dto';
import { BusinessService } from '../business/business.service';

@Controller('onboarding')
export class OnboardingController {
  constructor(
    private readonly onboardingService: OnboardingService,
    private readonly businessService: BusinessService,
  ) {}

  @Post('complete-profile')
  createProfile(@Body() createProfileDto: CreateProfileOnboardingDto) {
    return this.onboardingService.createProfile(createProfileDto);
  }
  @Post('create-business')
  createBusiness(@Body() createBusinessDto: CreateBusinessDto) {
    return this.businessService.createBusiness(createBusinessDto);
  }

  //mover a modulo Products & Categories
  /* @Post('create-categories')
  createCategories(@Body() createCategoriesDto: CreateCategoriesDto) {
    return this.businessService.createCategories(createCategoriesDto);
  }
  @Post('create-products')
  createProducts(@Body() createProductsDto: CreateProductsDto) {
    return this.businessService.createProducts(createProductsDto);
  } */
}
