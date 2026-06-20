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
  UseGuards,
  DefaultValuePipe,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import {
  ClientResponseDto,
  ClientListResponseDto,
  ClientStatsDto,
} from './dto/client-response.dto';
import { EmailConfirmedGuard } from '../auth/guards/email-confirmed.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { BusinessAccess } from 'src/common/decorators/business-access.decorator';
import { BusinessAccessGuard } from '../auth/guards/business-access.guard';

@Controller('clients')
@UseGuards(JwtAuthGuard, EmailConfirmedGuard, BusinessAccessGuard, RolesGuard)
@BusinessAccess()
@Roles(Role.ADMIN, Role.OWNER)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  /**
   * Crear un nuevo cliente
   */
  @Post('/business/:businessId/new')
  @Roles(Role.OWNER, Role.ADMIN, Role.EMPLOYEE)
  async create(
    @Body() createClientDto: CreateClientDto,
  ): Promise<{ message: string; client: ClientResponseDto }> {
    return this.clientsService.create(createClientDto);
  }

  /**
   * Obtener clientes por negocio con filtros y paginación
   */
  @Get('business/:businessId/list')
  @Roles(Role.OWNER, Role.ADMIN, Role.EMPLOYEE)
  async findAllByBusiness(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('dni') dni?: string,
  ): Promise<ClientListResponseDto> {
    return this.clientsService.findAllByBusiness(
      businessId,
      page,
      limit,
      search,
      dni,
    );
  }

  /**
   * Obtener un cliente específico
   */
  @Get('/business/:businessId/clientId/:id')
  @Roles(Role.OWNER, Role.ADMIN, Role.EMPLOYEE)
  @UseGuards(BusinessAccessGuard)
  @BusinessAccess()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('businessId', ParseUUIDPipe) businessId: string,
  ): Promise<ClientResponseDto> {
    return this.clientsService.findOne(id, businessId);
  }

  /**
   * Actualizar un cliente
   */
  @Patch('/business/:businessId/update/:id')
  @Roles(Role.OWNER, Role.ADMIN, Role.EMPLOYEE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Body() updateClientDto: UpdateClientDto,
  ): Promise<{ message: string; client: ClientResponseDto }> {
    console.log('llego');
    return this.clientsService.update(id, businessId, updateClientDto);
  }

  /**
   * Eliminar un cliente (soft delete)
   */
  @Patch('/business/:businessId/delete/:id')
  @Roles(Role.OWNER, Role.ADMIN)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('businessId', ParseUUIDPipe) businessId: string,
  ): Promise<{ message: string }> {
    return this.clientsService.remove(id, businessId);
  }

  /**
   * Obtener estadísticas de un cliente
   */
  @Get('/business/:businessId/:id/stats')
  @Roles(Role.OWNER, Role.ADMIN, Role.EMPLOYEE)
  async getClientStats(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('businessId', ParseUUIDPipe) businessId: string,
  ): Promise<ClientStatsDto> {
    return this.clientsService.getClientStats(id, businessId);
  }

  /**
   * Buscar cliente por DNI
   */
  @Get('/business/:businessId/search/dni/:dni')
  @Roles(Role.OWNER, Role.ADMIN, Role.EMPLOYEE)
  async findByDni(
    @Param('dni') dni: string,
    @Param('businessId', ParseUUIDPipe) businessId: string,
  ): Promise<ClientResponseDto | null> {
    return this.clientsService.findByDni(dni, businessId);
  }

  /**
   * Obtener clientes con más compras
   */
  @Get('/business/:businessId/top-customers')
  @Roles(Role.OWNER, Role.ADMIN, Role.EMPLOYEE)
  async getTopCustomers(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<ClientResponseDto[]> {
    return this.clientsService.getTopCustomers(businessId, limit);
  }
}
