import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EstoqueRepository } from './estoque.repository';
import { ListarEstoqueDto, RelatorioEstoqueDto } from './dto/filtros-estoque.dto';
import { EntradaEstoqueDto } from './dto/entrada-estoque.dto';
import { BaixaEstoqueDto } from './dto/baixa-estoque.dto';
import { DescarteVencidosDto } from './dto/descarte-vencidos.dto';

const DIAS_PARA_MEDIA = 30;

@Injectable()
export class EstoqueService {
  constructor(private readonly repository: EstoqueRepository) {}

  listar(filtros: ListarEstoqueDto) {
    return this.repository.listar(filtros);
  }
  async registrarEntrada(dto: EntradaEstoqueDto) {
    const hoje = this.hoje();
    await this.validarLojaEItem(dto.lojaId, dto.itemId);
    if (dto.dataValidade && dto.dataValidade < hoje) {
      throw new BadRequestException('Não é permitido registrar um lote já vencido');
    }
    const existente = await this.repository.buscarLote(dto.lojaId, dto.itemId, dto.lote);
    if (existente && existente.dataValidade !== (dto.dataValidade ?? null)) {
      throw new ConflictException('Esse lote já existe com outra data de validade');
    }
    await this.repository.registrarEntrada({
      dataReferencia: hoje,
      lojaId: dto.lojaId,
      itemId: dto.itemId,
      lote: dto.lote,
      dataValidade: dto.dataValidade ?? null,
      quantidade: dto.quantidade
    });
    return this.repository.buscarLoteDoDia(hoje, dto.lojaId, dto.itemId, dto.lote);
  }
  async registrarBaixa(dto: BaixaEstoqueDto) {
    const hoje = this.hoje();
    await this.validarLojaEItem(dto.lojaId, dto.itemId);
    const lotes = (await this.repository.listarLotesDoItem(dto.lojaId, dto.itemId))
      .filter(lote => lote.dataValidade === null || lote.dataValidade >= hoje);
    const disponivel = lotes.reduce((soma, lote) => soma + lote.quantidade, 0);
    if (disponivel < dto.quantidade) {
      throw new ConflictException(`Estoque insuficiente: há ${disponivel} unidade(s) dentro da validade`);
    }
    let restante = dto.quantidade;
    const retiradas: { dataReferencia: string; lote: string; quantidade: number }[] = [];
    for (const lote of lotes) {
      if (restante === 0) break;
      const quantidade = Math.min(lote.quantidade, restante);
      retiradas.push({ dataReferencia: lote.dataReferencia, lote: lote.lote, quantidade });
      restante -= quantidade;
    }
    await this.repository.aplicarBaixa(dto.lojaId, dto.itemId, retiradas);
    return { retiradas, quantidadeRestante: disponivel - dto.quantidade };
  }
  async descartarVencidos(dto: DescarteVencidosDto) {
    const hoje = this.hoje();
    if (!await this.repository.buscarLoja(dto.lojaId)) throw new NotFoundException('Loja não encontrada');
    const vencidos = await this.repository.listarVencidos(dto.lojaId, hoje);
    const lotes = vencidos.map(lote => ({
      itemId: lote.itemId,
      item: lote.item,
      lote: lote.lote,
      dataValidade: lote.dataValidade,
      quantidade: lote.quantidade,
      perda: Math.round(lote.quantidade * lote.custoMedio * 100) / 100
    }));
    await this.repository.removerVencidos(dto.lojaId, hoje);
    return {
      lotes,
      quantidadeTotal: lotes.reduce((soma, lote) => soma + lote.quantidade, 0),
      perdaTotal: Math.round(lotes.reduce((soma, lote) => soma + lote.perda, 0) * 100) / 100
    };
  }
  async valorPorLoja(filtros: RelatorioEstoqueDto) {
    await this.validarLojaDoFiltro(filtros.lojaId);
    return this.repository.valorPorLoja(filtros, this.hoje());
  }

  async cobertura(filtros: RelatorioEstoqueDto) {
    await this.validarLojaDoFiltro(filtros.lojaId);
    const hoje = this.hoje();
    const inicio = new Date(`${hoje}T00:00:00Z`);
    inicio.setUTCDate(inicio.getUTCDate() - DIAS_PARA_MEDIA);
    return this.repository.cobertura(filtros, hoje, inicio.toISOString().slice(0, 10), DIAS_PARA_MEDIA);
  }
  private hoje() {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  }

  private async validarLojaEItem(lojaId: number, itemId: number) {
    if (!await this.repository.buscarLoja(lojaId)) throw new NotFoundException('Loja não encontrada');
    if (!await this.repository.buscarItem(itemId)) throw new NotFoundException('Item não encontrado');
  }

  private async validarLojaDoFiltro(lojaId?: number) {
    if (lojaId !== undefined && !await this.repository.buscarLoja(lojaId)) {
      throw new NotFoundException('Loja não encontrada');
    }
  }
}
