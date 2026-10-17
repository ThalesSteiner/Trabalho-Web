import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../common/database/knex.module';
import { PedidoCompra, CriarPedidoCompra, AtualizarPedidoCompra, FormaPagamento, Promocao, Item } from './pedidoCompra.entity';

type PedidoCompraRow = {
  id: number;
  item: string;
  quantidade: number;
  forma_pagamento: FormaPagamento;
};

type PromocaoRow = {
  id: number;
  item: string;
  nome: string;
  tipo: string;
  valor: number | string | null;
  leve: number | null;
  pague: number | null;
};

type ItemRow = {
  id: number;
  nome: string;
  categoria: string;
  preco: number | string;
};

const TABELA = 'pedido_compra';

@Injectable()
export class PedidoCompraRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

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
    );
  }

  async buscarItemPorNome(nome: string): Promise<Item | null> { //busca o item na tabela itens
    const row = await this.knex<ItemRow>('itens').where({ nome }).first();
    return row ? new Item(row.id, row.nome, row.categoria, Number(row.preco)) : null;
  }
}
