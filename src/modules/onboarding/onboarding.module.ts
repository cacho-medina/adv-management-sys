import { Module } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { BusinessModule } from '../business/business.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [BusinessModule, ProductsModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
