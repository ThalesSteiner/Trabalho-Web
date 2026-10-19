import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../common/database/knex.module';
<<<<<<< HEAD
import { PedidoCompra, CriarPedidoCompra, AtualizarPedidoCompra, FormaPagamento, Promocao, Item, FiltrosPedidoCompra, ResultadoPaginado } from './pedidoCompra.entity';
=======
import { PedidoCompra, CriarPedidoCompra, AtualizarPedidoCompra, Promocao, FiltrosPedidoCompra, ResultadoPaginado } from './pedidoCompra.entity';
>>>>>>> dfec6202250c98aa1e48b7658169e770669d7ed9

type PedidoCompraRow = {
  id: number;
  dataRecebimento: string;
  lojaId: number;
  itemId: number;
  fornecedorId: number;
  funcionarioId: number;
  quantidade: number;
  custoUnitario: number;
};

type PromocaoRow = {
  id: number;
  itemId: number;
  nome: string;
  tipoPromocaoId: string;
  valor: number | null;
  qtdLeve: number | null;
  qtdPague: number | null;
};

const TABELA = 'fat_compra';

@Injectable()
export class PedidoCompraRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  transacao<T>(executar: (trx: Knex.Transaction) => Promise<T>) {
    return this.knex.transaction(executar);
  }

  private paraEntity(row: PedidoCompraRow): PedidoCompra {
    return new PedidoCompra(row.id, row.dataRecebimento, row.lojaId, row.itemId, row.fornecedorId, row.funcionarioId, row.quantidade, row.custoUnitario);
  }

<<<<<<< HEAD
  async listar(filtros: FiltrosPedidoCompra, pagina: number, limite: number): Promise<ResultadoPaginado<PedidoCompra>> {
  const aplicarFiltros = (qb: Knex.QueryBuilder) =>{
    if (filtros.item) {
      qb.whereILike('item', `%${filtros.item}%`);
    }
    if (filtros.formaPagamento) {
      qb.where('forma_pagamento', filtros.formaPagamento);
    }
    if (filtros.quantidadeMin !== undefined) {
      qb.where('quantidade', '>=', filtros.quantidadeMin);
    }
    if (filtros.quantidadeMax !== undefined) {
      qb.where('quantidade', '<=', filtros.quantidadeMax);
    }
  };
  const [{ total }] = await this.knex(TABELA).modify(aplicarFiltros).count<{ total: string }[]>('* as total');
  const rows = await this.knex<PedidoCompraRow>(TABELA).modify(aplicarFiltros).select('*').orderBy('id').limit(limite).offset((pagina - 1) * limite);
  const totalNumero = Number(total);
  return {
    dados: rows.map((r) => this.paraEntity(r)),
    total: totalNumero,
    pagina,
    limite,
    totalPaginas: Math.ceil(totalNumero / limite),
  };
}

  async buscarPorId(id: number): Promise<PedidoCompra | null>{
    const row = await this.knex<PedidoCompraRow>(TABELA).where({ id }).first();
    return row ? this.paraEntity(row) : null;
  }

  async criar(dados: CriarPedidoCompra): Promise<PedidoCompra>{
    const [row] = await this.knex<PedidoCompraRow>(TABELA).insert({item: dados.item,quantidade: dados.quantidade, forma_pagamento: dados.formaPagamento})
      .returning('*');
    return this.paraEntity(row);
  }

  async atualizar(id: number, dados: AtualizarPedidoCompra): Promise<PedidoCompra | null>{
    const alteracoes: Partial<PedidoCompraRow> = {};
    if (dados.item !== undefined) alteracoes.item = dados.item;
    if (dados.quantidade !== undefined) alteracoes.quantidade = dados.quantidade;
    if (dados.formaPagamento !== undefined) alteracoes.forma_pagamento = dados.formaPagamento;
    if (Object.keys(alteracoes).length === 0) {
      return this.buscarPorId(id);
    }

    const [row] = await this.knex<PedidoCompraRow>(TABELA).where({ id }).update(alteracoes).returning('*');
    return row ? this.paraEntity(row) : null;
  }

  async remover(id: number): Promise<boolean> {
    const removidos = await this.knex<PedidoCompraRow>(TABELA).where({ id }).del();
    return removidos > 0;
  }

  async buscarPromocaoPorItem(nomeItem: string): Promise<Promocao | null> {//volta o row com promoção se tiver
    const row = await this.knex<PromocaoRow>('promocoes').where({ item: nomeItem }).first();
    if (!row) return null;
    return new Promocao(
      row.id,
      row.item,
      row.nome,
      row.tipo,
      row.valor === null ? null : Number(row.valor),
      row.leve,
      row.pague,
=======
  private selecionar() {
    return this.knex(TABELA).select(
      'id', this.knex.raw(`to_char(data_recebimento, 'YYYY-MM-DD') as data_recebimento`),
      'lojaId', 'itemId', 'fornecedorId', 'funcionarioId', 'quantidade', 'custoUnitario',
>>>>>>> dfec6202250c98aa1e48b7658169e770669d7ed9
    );
  }

  async listar(filtros: FiltrosPedidoCompra, pagina: number, limite: number): Promise<ResultadoPaginado<PedidoCompra>> {
  const aplicarFiltros = (qb: Knex.QueryBuilder) =>{
    if (filtros.lojaId) {
      qb.where('lojaId', filtros.lojaId);
    }
    if (filtros.itemId) {
      qb.where('itemId', filtros.itemId);
    }
    if (filtros.fornecedorId) {
      qb.where('fornecedorId', filtros.fornecedorId);
    }
    if (filtros.quantidadeMin !== undefined) {
      qb.where('quantidade', '>=', filtros.quantidadeMin);
    }
    if (filtros.quantidadeMax !== undefined) {
      qb.where('quantidade', '<=', filtros.quantidadeMax);
    }
  };
  const [{ total }] = await this.knex(TABELA).modify(aplicarFiltros).count<{ total: string }[]>('* as total');
  const rows: PedidoCompraRow[] = await this.selecionar().modify(aplicarFiltros).orderBy('dataRecebimento', 'desc').orderBy('id', 'desc').limit(limite).offset((pagina - 1) * limite);
  const totalNumero = Number(total);
  return {
    dados: rows.map((r) => this.paraEntity(r)),
    total: totalNumero,
    pagina,
    limite,
    totalPaginas: Math.ceil(totalNumero / limite),
  };
}

  async buscarPorId(id: number): Promise<PedidoCompra | null>{
    const row: PedidoCompraRow | undefined = await this.selecionar().where({ id }).first();
    return row ? this.paraEntity(row) : null;
  }

  async criar(dados: CriarPedidoCompra, trx: Knex): Promise<number>{
    const [{ id }] = await trx(TABELA).insert(dados).returning('id');
    return id;
  }

  async atualizar(id: number, dados: AtualizarPedidoCompra): Promise<PedidoCompra | null>{
    await this.knex(TABELA).where({ id }).update(dados);
    return this.buscarPorId(id);
  }

  async remover(id: number, trx: Knex): Promise<boolean> {
    const removidos = await trx(TABELA).where({ id }).del();
    return removidos > 0;
  }

  async fornecedorExiste(id: number): Promise<boolean> {
    return !!(await this.knex('dim_fornecedor').where({ id }).first('id'));
  }

  async funcionarioDoUsuario(usuarioId: string): Promise<number> {
    const funcionario = await this.knex('dim_funcionario').where({ usuarioId }).first('id');
    return funcionario?.id ?? -1;
  }

  async buscarPromocaoPorItem(itemId: number): Promise<Promocao | null> {//volta o row com promoção se tiver
    const row: PromocaoRow | undefined = await this.knex('dim_promocao').where({ itemId }).whereNot('tipoPromocaoId', 'NENHUMA').first();
    if (!row) return null;
    return new Promocao(row.id, row.itemId, row.nome, row.tipoPromocaoId, row.valor, row.qtdLeve, row.qtdPague);
  }

  async buscarNomeDoItem(itemId: number): Promise<string | null> { //busca o item na dim_item
    const row = await this.knex('dim_item').where({ id: itemId }).first('nome');
    return row?.nome ?? null;
  }
}
