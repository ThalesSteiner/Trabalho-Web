import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../common/database/knex.module';
import { AtualizarNotaDto } from './dto/atualizar-nota.dto';
import { ListarNotasDto } from './dto/listar-notas.dto';
import { NotaFiscal } from './nota-fiscal.types';

@Injectable()
export class NotaFiscalRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async listar({ page, limit, numero, lojaId, de, ate }: ListarNotasDto) {
    const filtro = this.knex('dim_nota_fiscal as n').whereNot('n.id', -1);
    if (numero) filtro.where('n.numero', numero.padStart(9, '0'));
    if (lojaId) {
      filtro.whereExists((q) =>
        q.select(1).from('fat_venda as v').where('v.notaFiscalId', this.knex.ref('n.id')).where('v.lojaId', lojaId),
      );
    }
    if (de) filtro.whereRaw("n.emitida_em >= (?::date)::timestamp at time zone 'America/Sao_Paulo'", [de]);
    if (ate) filtro.whereRaw("n.emitida_em < (?::date + 1)::timestamp at time zone 'America/Sao_Paulo'", [ate]);

    const [{ total }] = await filtro.clone().count({ total: '*' });
    const data: NotaFiscal[] = await filtro
      .select('n.*')
      .orderBy('n.id', 'desc')
      .offset((page - 1) * limit)
      .limit(limit);
    return { data, total: Number(total) };
  }

  buscarPorUuid(uuid: string): Promise<NotaFiscal | undefined> {
    return this.knex('dim_nota_fiscal').where({ uuid }).whereNot('id', -1).first();
  }

  buscarPorChave(chaveAcesso: string): Promise<NotaFiscal | undefined> {
    return this.knex('dim_nota_fiscal').where({ chaveAcesso }).first();
  }

  itens(notaFiscalId: number): Promise<{ item: string; quantidade: number; valorPago: number }[]> {
    return this.knex('fat_venda as v')
      .join('dim_item as i', 'i.id', 'v.itemId')
      .where('v.notaFiscalId', notaFiscalId)
      .select('i.nome as item', 'v.quantidade', 'v.valorPago')
      .orderBy('v.id');
  }

  venda(notaFiscalId: number) {
    return this.knex('fat_venda as v')
      .join('dim_loja as l', 'l.id', 'v.lojaId')
      .join('dim_forma_pagamento as f', 'f.id', 'v.formaPagamentoId')
      .where('v.notaFiscalId', notaFiscalId)
      .first('l.nomeLoja as loja', 'l.nomeCondominio as condominio', 'f.nome as formaPagamento', 'v.pedidoId');
  }

  async proximoNumero(trx: Knex): Promise<string> {
    const { rows } = await trx.raw(`select lpad(nextval('nota_fiscal_numero_seq')::text, 9, '0') as numero`);
    return rows[0].numero;
  }

  async cancelar(id: number, trx: Knex) {
    await trx('dim_nota_fiscal').where({ id }).update({ cancelada: true });
  }

  async atualizar(id: number, dados: AtualizarNotaDto) {
    await this.knex('dim_nota_fiscal').where({ id }).update(dados);
  }

  // vendas continuam, so ficam sem nota (-1)
  async excluir(id: number, trx?: Knex.Transaction): Promise<void> {
    if (!trx) return this.knex.transaction((t) => this.excluir(id, t));

    await trx('fat_venda').where({ notaFiscalId: id }).update({ notaFiscalId: -1 });
    await trx('pagamento').where({ notaFiscalId: id }).update({ notaFiscalId: null });
    await trx('dim_nota_fiscal').where({ id }).delete();
  }

  async salvar(nota: Pick<NotaFiscal, 'numero' | 'chaveAcesso' | 'emitidaEm'>, trx: Knex): Promise<NotaFiscal> {
    const [nova] = await trx('dim_nota_fiscal').insert(nota).returning('*');
    return nova;
  }
}
