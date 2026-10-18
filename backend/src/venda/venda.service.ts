import { Injectable, NotFoundException } from '@nestjs/common';
import type { UsuarioToken } from '../auth/auth.decorators';
import { ListarVendasDto } from './dto/listar-vendas.dto';
import { VendaRepository } from './venda.repository';

@Injectable()
export class VendaService {
  constructor(private readonly repository: VendaRepository) {}

  async listar(usuario: UsuarioToken, filtros: ListarVendasDto) {
    if (usuario.perfil === 'FUNCIONARIO') filtros.lojaId = usuario.lojaId;
    const { data, total } = await this.repository.listar(filtros);
    return { data, total, page: filtros.page, limit: filtros.limit };
  }

  async buscar(usuario: UsuarioToken, id: number) {
    const venda = await this.repository.buscarPorId(id);
    if (!venda || (usuario.perfil === 'FUNCIONARIO' && venda.lojaId !== usuario.lojaId)) {
      throw new NotFoundException('Venda não encontrada');
    }
    return venda;
  }
}
