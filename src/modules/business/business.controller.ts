import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BusinessService } from './business.service';
import {
  CreateBusinessDto,
  UpdateBusinessDto,
  InviteEmployeeDto,
  BusinessSettingsDto,
  BusinessResponseDto,
  BusinessListResponseDto,
  BusinessStatsDto,
  EmployeeResponseDto,
} from './dto/business.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { EmailConfirmedGuard } from '../auth/guards/email-confirmed.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { BusinessAccessGuard } from '../auth/guards/business-access.guard';
import { BusinessAccess } from 'src/common/decorators/business-access.decorator';

@Controller('business')
@UseGuards(JwtAuthGuard, EmailConfirmedGuard)
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  /**
   * Crear nuevo negocio
   */
  @Post('create-business')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async createBusiness(
    @Body() createBusinessDto: CreateBusinessDto,
  ): Promise<{ message: string; business: BusinessResponseDto }> {
    return this.businessService.createBusiness(createBusinessDto);
  }

  /**
   * Listar negocios del usuario
   */
  @Get()
  async findAllByUser(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    // @Req() req: any,
  ): Promise<BusinessListResponseDto> {
    // const { user } = req;
    // return this.businessService.findAllByUser(user.sub, page, limit);

    // Temporal para testing
    return this.businessService.findAllByUser('temp-user-id', page, limit);
  }

  /**
   * Obtener negocio específico
   */
  @Get(':id')
  @UseGuards(BusinessAccessGuard)
  @BusinessAccess()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    // @Req() req: any,
  ): Promise<BusinessResponseDto> {
    // const { user } = req;
    // return this.businessService.findOne(id, user.sub);

    // Temporal para testing
    return this.businessService.findOne(id, 'temp-user-id');
  }

  /**
   * Actualizar negocio
   */
  @Patch(':id')
  @UseGuards(BusinessAccessGuard, RolesGuard)
  @BusinessAccess()
  @Roles(Role.OWNER, Role.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
    // @Req() req: any,
  ): Promise<{ message: string; business: BusinessResponseDto }> {
    // const { user } = req;
    // return this.businessService.update(id, user.sub, updateBusinessDto);

    // Temporal para testing
    return this.businessService.update(id, 'temp-user-id', updateBusinessDto);
  }

  /**
   * Eliminar negocio
   */
  @Delete(':id')
  @UseGuards(BusinessAccessGuard, RolesGuard)
  @BusinessAccess()
  @Roles(Role.OWNER)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    // @Req() req: any,
  ): Promise<{ message: string }> {
    // const { user } = req;
    // return this.businessService.remove(id, user.sub);

    // Temporal para testing
    return this.businessService.remove(id, 'temp-user-id');
  }

  /**
   * Obtener estadísticas del negocio
   */
  @Get(':id/stats')
  @UseGuards(BusinessAccessGuard, RolesGuard)
  @BusinessAccess()
  @Roles(Role.OWNER, Role.ADMIN)
  async getStats(
    @Param('id', ParseUUIDPipe) id: string,
    // @Req() req: any,
  ): Promise<BusinessStatsDto> {
    // const { user } = req;
    // return this.businessService.getStats(id, user.sub);

    // Temporal para testing
    return this.businessService.getStats(id, 'temp-user-id');
  }

  /**
   * Obtener empleados del negocio
   */
  @Get(':id/employees')
  @UseGuards(BusinessAccessGuard, RolesGuard)
  @BusinessAccess()
  @Roles(Role.OWNER, Role.ADMIN)
  async getEmployees(
    @Param('id', ParseUUIDPipe) id: string,
    // @Req() req: any,
  ): Promise<EmployeeResponseDto[]> {
    // const { user } = req;
    // return this.businessService.getEmployees(id, user.sub);

    // Temporal para testing
    return this.businessService.getEmployees(id, 'temp-user-id');
  }

  /**
   * Invitar empleado al negocio
   */
  @Post(':id/invite')
  @UseGuards(BusinessAccessGuard, RolesGuard)
  @BusinessAccess()
  @Roles(Role.OWNER)
  async inviteEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() inviteDto: InviteEmployeeDto,
    // @Req() req: any,
  ): Promise<{ message: string }> {
    // const { user } = req;
    // return this.businessService.inviteEmployee(id, user.sub, inviteDto);

    // Temporal para testing
    return this.businessService.inviteEmployee(id, 'temp-user-id', inviteDto);
  }

  /**
   * Actualizar configuraciones del negocio
   */
  @Patch(':id/settings')
  @UseGuards(BusinessAccessGuard, RolesGuard)
  @BusinessAccess()
  @Roles(Role.OWNER)
  async updateSettings(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() settingsDto: BusinessSettingsDto,
    // @Req() req: any,
  ): Promise<{ message: string }> {
    // const { user } = req;
    // return this.businessService.updateSettings(id, user.sub, settingsDto);

    // Temporal para testing
    return this.businessService.updateSettings(id, 'temp-user-id', settingsDto);
  }
}
