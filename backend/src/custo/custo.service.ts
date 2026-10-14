import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CustoRepository } from './custo.repository';
import { CriarCustoDto } from './dto/criar-custo.dto';
import { AtualizarCustoDto } from './dto/atualizar-custo.dto';
import { FiltrosCustoDto, ListarCustosDto } from './dto/filtros-custo.dto';

@Injectable()
export class CustoService {
  constructor(private readonly repository: CustoRepository) {}

  async criar(dto: CriarCustoDto) {
    await this.validarVinculos(dto);
    return this.gravar(() => this.repository.criar(dto));
  }

  listar(filtros: ListarCustosDto) {
    this.validarFiltros(filtros);
    return this.repository.listar(filtros);
  }

  async buscarPorId(id: number) {
    this.validarId(id);
    const custo = await this.repository.buscarPorId(id);
    if (!custo) throw new NotFoundException('Custo não encontrado');
    return custo;
  }

  async atualizar(id: number, dto: AtualizarCustoDto) {
    await this.buscarPorId(id);
    if (!Object.values(dto).some(valor => valor !== undefined)) {
      throw new BadRequestException('Informe pelo menos um campo para atualizar');
    }
    await this.validarVinculos(dto);
    const custo = await this.gravar(() => this.repository.atualizar(id, dto));
    if (!custo) throw new NotFoundException('Custo não encontrado');
    return custo;
  }

  async excluir(id: number) {
    this.validarId(id);
    const excluidos = await this.repository.excluir(id);
    if (!excluidos) throw new NotFoundException('Custo não encontrado');
    return { mensagem: 'Custo excluído com sucesso' };
  }

  resumo(filtros: FiltrosCustoDto) {
    this.validarFiltros(filtros);
    return this.repository.resumo(filtros);
  }

  resumoPorCategoria(filtros: FiltrosCustoDto) {
    this.validarFiltros(filtros);
    return this.repository.resumoPorCategoria(filtros);
  }

  private validarId(id: number) {
    if (!Number.isSafeInteger(id) || id <= 0) throw new BadRequestException('Informe um ID positivo válido');
  }

  private validarLojaId(id: number) {
    if (!Number.isSafeInteger(id) || (id !== -1 && id <= 0)) {
      throw new BadRequestException('lojaId deve ser positivo ou -1 para despesas gerais da matriz');
    }
  }

  private validarFiltros(filtros: FiltrosCustoDto) {
    if (filtros.lojaId !== undefined) this.validarLojaId(filtros.lojaId);
    if (filtros.de && filtros.ate && filtros.de > filtros.ate) {
      throw new BadRequestException('A data inicial não pode ser posterior à data final');
    }
  }

  private async validarVinculos(dto: AtualizarCustoDto) {
    if (dto.lojaId !== undefined) {
      this.validarLojaId(dto.lojaId);
      if (!await this.repository.buscarLoja(dto.lojaId)) throw new NotFoundException('Loja não encontrada');
    }
    if (dto.categoriaCustoId !== undefined && !await this.repository.buscarCategoria(dto.categoriaCustoId)) {
      throw new NotFoundException('Categoria de custo não encontrada');
    }
  }

  private async gravar<T>(operacao: () => Promise<T>): Promise<T> {
    try {
      return await operacao();
    } catch (erro) {
      if ((erro as { code?: string }).code === '23503') {
        throw new ConflictException('A loja ou categoria vinculada não está mais disponível');
      }
      throw erro;
    }
  }
}
