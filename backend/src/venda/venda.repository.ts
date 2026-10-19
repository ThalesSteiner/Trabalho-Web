import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../common/database/knex.module';
import { ListarVendasDto } from './dto/listar-vendas.dto';

const colunas = [
  'v.id', 'v.dataHoraVenda', 'v.pedidoId', 'v.quantidade', 'v.valorPago',
  'v.lojaId', 'l.nomeLoja as loja', 'v.itemId', 'i.nome as item', 'v.clienteId', 'c.nome as cliente',
  'fp.nome as formaPagamento', 'n.numero as notaNumero',
];

@Injectable()
export class VendaRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async listar({ page, limit, lojaId, itemId, pedidoId, de, ate }: ListarVendasDto) {
    const filtro = this.knex('fat_venda as v');
    if (lojaId) filtro.where('v.lojaId', lojaId);
    if (itemId) filtro.where('v.itemId', itemId);
    if (pedidoId) filtro.where('v.pedidoId', pedidoId);
    if (de) filtro.whereRaw("v.data_hora_venda >= (?::date)::timestamp at time zone 'America/Sao_Paulo'", [de]);
    if (ate) filtro.whereRaw("v.data_hora_venda < (?::date + 1)::timestamp at time zone 'America/Sao_Paulo'", [ate]);

    const [{ total }] = await filtro.clone().count({ total: '*' });
    const data = await this.comNomes(filtro)
      .orderBy('v.dataHoraVenda', 'desc')
      .orderBy('v.id')
      .offset((page - 1) * limit)
      .limit(limit);
    return { data, total: Number(total) };
  }

  buscarPorId(id: number) {
    return this.comNomes(this.knex('fat_venda as v')).where('v.id', id).first();
  }

  private comNomes(consulta: Knex.QueryBuilder) {
    return consulta
      .join('dim_loja as l', 'l.id', 'v.lojaId')
      .join('dim_item as i', 'i.id', 'v.itemId')
      .join('dim_cliente as c', 'c.id', 'v.clienteId')
      .join('dim_forma_pagamento as fp', 'fp.id', 'v.formaPagamentoId')
      .join('dim_nota_fiscal as n', 'n.id', 'v.notaFiscalId')
      .select(colunas);
  }
}
