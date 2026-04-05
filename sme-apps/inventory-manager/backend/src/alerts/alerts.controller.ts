import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { IsInt, Min, IsNotEmpty } from 'class-validator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

class UpdateThresholdDto {
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  reorderThreshold: number;
}

@Controller('alerts')
export class AlertsController {
  constructor(private alertsService: AlertsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF)
  findAll() {
    return this.alertsService.findAll();
  }

  @Patch(':productId')
  @Roles(Role.MANAGER, Role.ADMIN)
  updateThreshold(@Param('productId') productId: string, @Body() dto: UpdateThresholdDto) {
    return this.alertsService.updateThreshold(productId, dto.reorderThreshold);
  }
}
