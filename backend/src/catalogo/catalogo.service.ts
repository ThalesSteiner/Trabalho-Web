import { Injectable, NotFoundException } from '@nestjs/common';
import { CatalogoRepository } from './catalogo.repository';
import { ListarCatalogoDto } from './dto/listar-catalogo.dto';
import { ListarLojasCatalogoDto } from './dto/listar-lojas-catalogo.dto';

@Injectable()
export class CatalogoService {
  constructor(private readonly repository: CatalogoRepository) {}

  async lojas(filtros: ListarLojasCatalogoDto) {
    const { data, total } = await this.repository.lojas(filtros);
    return { data, total, page: filtros.page, limit: filtros.limit };
  }

  async itens(lojaId: number, filtros: ListarCatalogoDto) {
    const loja = await this.repository.buscarLoja(lojaId);
    if (!loja) throw new NotFoundException('Loja não encontrada');

    const { data, total } = await this.repository.itens(lojaId, filtros);
    return {
      loja,
      data: data.map(({ promocaoTipo, promocao, promocaoValor, qtdLeve, qtdPague, ...item }) => ({
        ...item,
        promocao: promocaoTipo ? { tipo: promocaoTipo, nome: promocao, valor: promocaoValor, qtdLeve, qtdPague } : null,
      })),
      total,
      page: filtros.page,
      limit: filtros.limit,
    };
  }
}
