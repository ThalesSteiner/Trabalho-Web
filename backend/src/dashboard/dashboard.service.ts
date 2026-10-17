import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';
import { FiltrosDashboardDto, ListarDashboardDto} from './dto/filtros-dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly repository: DashboardRepository) {}
  
  async resumo(filtros: FiltrosDashboardDto) {
    await this.validarFiltros(filtros);
    const totais = await this.repository.resumo(filtros);
    const ticketMedio = totais.quantidadePedidos > 0
      ? Math.round((totais.faturamento / totais.quantidadePedidos) * 100) / 100
      : 0;
    return { ...totais, ticketMedio };
  }
    async maisVendidos(filtros: ListarDashboardDto) {
    await this.validarFiltros(filtros);
    return this.repository.maisVendidos(filtros);
  }

  async vendasPorLoja(filtros: ListarDashboardDto) {
    await this.validarFiltros(filtros);
    return this.repository.vendasPorLoja(filtros);
  }

  async vendasPorDia(filtros: ListarDashboardDto) {
    await this.validarFiltros(filtros);
    return this.repository.vendasPorDia(filtros);
  }
    private async validarFiltros(filtros: FiltrosDashboardDto) {
    if (filtros.de && filtros.ate && filtros.de > filtros.ate) {
      throw { status: 400, message: 'A data inicial não pode ser posterior à data final' };
    }
    if (filtros.lojaId !== undefined && !await this.repository.buscarLoja(filtros.lojaId)) {
      throw { status: 404, message: 'Loja não encontrada' };
    }
  }
}


