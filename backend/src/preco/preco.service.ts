import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AtualizarPrecoDto } from './dto/atualizar-preco.dto';
import { CriarPrecoDto } from './dto/criar-preco.dto';
import { HistoricoPrecoDto, ListarPrecosDto } from './dto/listar-precos.dto';
import { PrecoRepository } from './preco.repository';
import type { DadosPreco, Preco } from './preco.types';

@Injectable()
export class PrecoService {
  constructor(private readonly repository: PrecoRepository) {}

  listar(filtros: ListarPrecosDto) {
    return this.repository.listar(filtros);
  }

  async buscarPorId(id: number) {
    const preco = await this.repository.buscarPorId(id);
    if (!preco) throw new NotFoundException('Preço não encontrado');
    return preco;
  }

  async historico(itemId: number, filtros: HistoricoPrecoDto) {
    const item = await this.repository.buscarItem(itemId);
    if (!item) throw new NotFoundException('Item não encontrado');
    if (filtros.lojaId !== undefined) {
      if (!await this.repository.buscarLoja(filtros.lojaId)) throw new NotFoundException('Loja não encontrada');
    }
    return { item, ...await this.repository.historico(itemId, filtros) };
  }

  criar(dto: CriarPrecoDto) {
    const dados: DadosPreco = { ...dto, fimVigencia: dto.fimVigencia ?? null };
    return this.gravar(() => this.repository.transacao(async trx => {
      if (!await this.repository.bloquearItem(dto.itemId, trx)) throw new NotFoundException('Item não encontrado');
      if (!await this.repository.buscarLoja(dto.lojaId, trx)) throw new NotFoundException('Loja não encontrada');
      if (await this.repository.vendaDepoisDoNovoInicio(dados, trx)) {
        throw new ConflictException('O novo preço deve começar depois das vendas já registradas com o preço anterior');
      }
      await this.repository.encerrarAnteriorAberto(dados, trx);
      if (await this.repository.buscarSobreposicao(dados, trx)) {
        throw new ConflictException('Já existe preço para este item e loja no período informado');
      }
      return this.repository.criar(dados, trx);
    }));
  }

  async atualizar(id: number, dto: AtualizarPrecoDto) {
    const anterior = await this.buscarPorId(id);
    const campos = Object.fromEntries(Object.entries(dto).filter(([, valor]) => valor !== undefined));
    return this.gravar(() => this.repository.transacao(async trx => {
      await this.repository.bloquearItem(anterior.itemId, trx);
      const atual = await this.repository.buscarPorId(id, trx);
      if (!atual) throw new NotFoundException('Preço não encontrado');
      const dados = { ...atual, ...campos };
      this.validarPeriodo(dados);
      if (dados.fimVigencia !== null && await this.repository.vendaForaDoFim(id, dados.fimVigencia, trx)) {
        throw new ConflictException('fimVigencia deve ser posterior às vendas já registradas com este preço');
      }
      if (await this.repository.possuiVendas(id, trx)) {
        const mudouValor = dto.valor !== undefined && dto.valor !== atual.valor;
        const mudouInicio = dto.inicioVigencia !== undefined && new Date(dto.inicioVigencia).getTime() !== new Date(atual.inicioVigencia).getTime();
        if (mudouValor || mudouInicio) {
          throw new ConflictException('Preço utilizado em venda: cadastre um novo preço para preservar o histórico');
        }
      }
      if (await this.repository.buscarSobreposicao(dados, trx, id)) {
        throw new ConflictException('O período informado se sobrepõe a outro preço do mesmo item e loja');
      }
      return this.repository.atualizar(id, campos, trx);
    }));
  }

  async excluir(id: number) {
    const preco = await this.buscarPorId(id);
    return this.gravar(() => this.repository.transacao(async trx => {
      await this.repository.bloquearItem(preco.itemId, trx);
      if (!await this.repository.buscarPorId(id, trx)) throw new NotFoundException('Preço não encontrado');
      if (await this.repository.possuiVendas(id, trx)) {
        throw new ConflictException('O preço possui vendas vinculadas e não pode ser excluído');
      }
      await this.repository.excluir(id, trx);
      return { mensagem: 'Preço excluído com sucesso' };
    }));
  }

  private validarPeriodo(dados: Pick<Preco, 'inicioVigencia' | 'fimVigencia'>) {
    if (dados.fimVigencia !== null && new Date(dados.fimVigencia).getTime() <= new Date(dados.inicioVigencia).getTime()) {
      throw new BadRequestException('fimVigencia deve ser posterior a inicioVigencia');
    }
  }

  private async gravar<T>(operacao: () => Promise<T>): Promise<T> {
    try {
      return await operacao();
    } catch (erro) {
      if ((erro as { code?: string }).code === '23503') {
        throw new ConflictException('O registro possui vínculos ou o item/loja não está mais disponível');
      }
      throw erro;
    }
  }
}