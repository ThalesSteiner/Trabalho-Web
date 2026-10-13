import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../database/knex.module';
import { NovoPagamento, Pagamento } from './pagamento.types';

export type Promocao = { id: number; tipo: string; valor: number | null; leve: number | null; pague: number | null };

@Injectable()
export class PagamentoRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async criar(pagamento: NovoPagamento): Promise<Pagamento> {
    const [novo] = await this.knex('pagamento')
      .insert({ ...pagamento, itens: JSON.stringify(pagamento.itens) })
      .returning('*');
    return novo;
  }

  async atualizar(id: string, dados: Partial<Pagamento>, trx: Knex = this.knex) {
    await trx('pagamento').where({ id }).update(dados);
  }

  buscarPorId(id: string, trx: Knex = this.knex) {
    return this.comNota(trx).where('p.id', id).first();
  }

  formas(): Promise<{ id: number; nome: string }[]> {
    return this.knex('dim_forma_pagamento').select('id', 'nome').orderBy('id');
  }

  buscarLoja(id: number): Promise<{ id: number; nome: string } | undefined> {
    return this.knex('dim_loja').where({ id }).whereNot('id', -1).first('id', 'nomeLoja as nome');
  }

  buscarForma(id: number): Promise<{ id: number; nome: string } | undefined> {
    return this.knex('dim_forma_pagamento').where({ id }).first('id', 'nome');
  }

  precoVigente(itemId: number, lojaId: number): Promise<{ id: number; valor: number } | undefined> {
    return this.knex('dim_preco')
      .where({ itemId })
      .whereIn('lojaId', [lojaId, -1])
      .where('inicioVigencia', '<=', this.knex.fn.now())
      .where((q) => q.whereNull('fimVigencia').orWhere('fimVigencia', '>', this.knex.fn.now()))
      .orderByRaw('loja_id = ? desc', [lojaId])
      .first('id', 'valor');
  }

  promocaoDoItem(itemId: number): Promise<Promocao | undefined> {
    return this.knex('dim_promocao')
      .where({ itemId })
      .whereNot('tipoPromocaoId', 'NENHUMA')
      .first('id', 'tipoPromocaoId as tipo', 'valor', 'qtdLeve as leve', 'qtdPague as pague');
  }

  private comNota(trx: Knex) {
    return trx('pagamento as p')
      .leftJoin('dim_nota_fiscal as n', 'n.id', 'p.notaFiscalId')
      .select('p.*', 'n.uuid as notaUuid', 'n.numero as notaNumero', 'n.chaveAcesso as notaChave');
  }
}
