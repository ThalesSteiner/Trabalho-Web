import { Controller, Get, Query } from '@nestjs/common';
import { Perfis } from '../auth/auth.decorators';
import { DashboardService } from './dashboard.service';
import { FiltrosDashboardDto, MaisVendidosDto } from './dto/filtros-dashboard.dto';

@Perfis('ADMIN')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}
    @Get('vendas')
  resumo(@Query() filtros: FiltrosDashboardDto) {
    return this.service.resumo(filtros);
  }

  @Get('mais-vendidos')
  maisVendidos(@Query() filtros: MaisVendidosDto) {
  return this.service.maisVendidos(filtros);
  }

  @Get('vendas-por-loja')
  vendasPorLoja(@Query() filtros: FiltrosDashboardDto) {
return this.service.vendasPorLoja(filtros);
  }

  @Get('vendas-por-dia')
  vendasPorDia(@Query() filtros: FiltrosDashboardDto) {
    return this.service.vendasPorDia(filtros);
  }
}
