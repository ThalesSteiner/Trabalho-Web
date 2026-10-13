import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../database/knex.module';
import { NotaFiscal } from './nota-fiscal.types';

@Injectable()
export class NotaFiscalRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  buscarPorUuid(uuid: string): Promise<NotaFiscal | undefined> {
    return this.knex('dim_nota_fiscal').where({ uuid }).whereNot('id', -1).first();
  }

  async proximoNumero(trx: Knex): Promise<string> {
    const { rows } = await trx.raw(`select lpad(nextval('nota_fiscal_numero_seq')::text, 9, '0') as numero`);
    return rows[0].numero;
  }

  async salvar(nota: Pick<NotaFiscal, 'numero' | 'chaveAcesso' | 'emitidaEm'>, trx: Knex): Promise<NotaFiscal> {
    const [nova] = await trx('dim_nota_fiscal').insert(nota).returning('*');
    return nova;
  }
}
