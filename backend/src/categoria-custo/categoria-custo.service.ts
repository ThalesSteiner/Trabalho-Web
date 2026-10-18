import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CategoriaCustoRepository } from './categoria-custo.repository';
import { CriarCategoriaCustoDto } from './dto/criar-categoria-custo.dto';
import { AtualizarCategoriaCustoDto } from './dto/atualizar-categoria-custo.dto';
import { ListarCategoriasCustoDto } from './dto/listar-categorias-custo.dto';

@Injectable()
export class CategoriaCustoService {
  constructor(private readonly repository: CategoriaCustoRepository) {}

  listar(filtros: ListarCategoriasCustoDto) {
    return this.repository.listar(filtros);
  }

  async buscarPorId(id: number) {
    const categoria = await this.repository.buscarPorId(id);
    if (!categoria) throw new NotFoundException('Categoria de custo não encontrada');
    return categoria;
  }

  criar(dto: CriarCategoriaCustoDto) {
    return this.repository.criar(dto.nome);
  }

  async atualizar(id: number, dto: AtualizarCategoriaCustoDto) {
    const categoria = await this.repository.atualizar(id, dto.nome);
    if (!categoria) throw new NotFoundException('Categoria de custo não encontrada');
    return categoria;
  }

  async excluir(id: number) {
    if (await this.repository.possuiCustos(id)) {
      throw new ConflictException('A categoria possui despesas vinculadas e não pode ser excluída');
    }
    try {
      const excluidos = await this.repository.excluir(id);
      if (!excluidos) throw new NotFoundException('Categoria de custo não encontrada');
      return { mensagem: 'Categoria de custo excluída com sucesso' };
    } catch (erro) {
      if ((erro as { code?: string }).code === '23503') {
        throw new ConflictException('A categoria possui despesas vinculadas e não pode ser excluída');
      }
      throw erro;
    }
  }
}
