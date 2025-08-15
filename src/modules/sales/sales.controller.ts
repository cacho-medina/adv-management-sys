import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { EmailConfirmedGuard } from '../auth/guards/email-confirmed.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { BusinessAccessGuard } from '../auth/guards/business-access.guard';
import { BusinessAccess } from 'src/common/decorators/business-access.decorator';

@Controller('sales')
@UseGuards(JwtAuthGuard, EmailConfirmedGuard, BusinessAccessGuard, RolesGuard)
@BusinessAccess()
@Roles(Role.OWNER, Role.EMPLOYEE)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post('register')
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get('/business/:businessId/all')
  findAll(
    @Param('businessId') businessId: string,
    @Query('clientId') clientId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.salesService.findSales({
      businessId,
      clientId,
      status,
      startDate,
      endDate,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  @Get('/business/:businessId/sale/:saleId')
  findOne(
    @Param('businessId') businessId: string,
    @Param('saleId') saleId: string,
  ) {
    return this.salesService.findOne(businessId, saleId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(+id, updateSaleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesService.remove(+id);
  }
}
