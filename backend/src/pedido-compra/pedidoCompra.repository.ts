import { Knex } from 'knex';
import { db } from '../database/dados-mock'; //acho melhor ser aonde está o db knex do servidor
import { PedidoCompra, CriarPedidoCompra, AtualizarPedidoCompra, FormaPagamento } from './pedido-compra/pedidoCompra.entity.js';

type PedidoCompraRow = {
  id: number;
  item: string;
  quantidade: number;
  forma_pagamento: FormaPagamento;
};

const TABELA = 'pedido_compra';

export class PedidoCompraRepository {
  constructor(private readonly knex: Knex = db) {}

  private paraEntity(row: PedidoCompraRow): PedidoCompra {
    return new PedidoCompra(row.id, row.item, row.quantidade, row.forma_pagamento);
  }

  async listar(): Promise<PedidoCompra[]> {
    const rows = await this.knex<PedidoCompraRow>(TABELA).select('*').orderBy('id');
    return rows.map((r) => this.paraEntity(r));
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
}
