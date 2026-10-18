import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AtualizarItemDto } from './dto/atualizar-item.dto';
import { CriarItemDto } from './dto/criar-item.dto';
import { ListarItensDto } from './dto/listar-itens.dto';
import { ItemRepository } from './item.repository';

@Injectable()
export class ItemService {
  constructor(private readonly repository: ItemRepository) {}

  async listar(filtros: ListarItensDto) {
    const { data, total } = await this.repository.listar(filtros);
    return { data, total, page: filtros.page, limit: filtros.limit };
  }

  async buscar(id: number) {
    const item = await this.repository.buscarPorId(id);
    if (!item) throw new NotFoundException('Item não encontrado');
    return item;
  }

  criar(dto: CriarItemDto) {
    return this.repository.criar(dto);
  }

  async atualizar(id: number, dto: AtualizarItemDto) {
    await this.buscar(id);
    if (Object.values(dto).every((valor) => valor === undefined)) {
      throw new BadRequestException('Informe ao menos um campo para atualizar');
    }

    await this.repository.atualizar(id, dto);
    return this.buscar(id);
  }

  async excluir(id: number) {
    await this.buscar(id);
    try {
      await this.repository.excluir(id);
    } catch (erro) {
      if ((erro as { code?: string }).code === '23503') {
        throw new ConflictException('O item possui vendas, compras, estoque, preços ou promoções e não pode ser excluído');
      }
      throw erro;
    }
    return { mensagem: 'Item excluído com sucesso' };
  }
}
