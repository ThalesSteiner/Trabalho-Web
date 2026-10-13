import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../database/knex.module';
import { NovoPagamento, Pagamento } from './pagamento.types';

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

  private comNota(trx: Knex) {
    return trx('pagamento as p')
      .leftJoin('dim_nota_fiscal as n', 'n.id', 'p.notaFiscalId')
      .select('p.*', 'n.uuid as notaUuid', 'n.numero as notaNumero', 'n.chaveAcesso as notaChave');
  }
}
