import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../database/knex.module';
import { FiltrosDashboardDto, ListarDashboardDto } from './dto/filtros-dashboard.dto';
const diaDaVenda = "(v.data_hora_venda at time zone 'America/Sao_Paulo')::date";

@Injectable()
export class DashboardRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async resumo(filtros: FiltrosDashboardDto) {
    const resultado = await this.filtrar(this.knex('fat_venda as v'), filtros)
      .countDistinct({ quantidadePedidos: 'v.pedidoId' }).sum({ faturamento: 'v.valorPago' })
      .first<{ quantidadePedidos: string | number; faturamento: string | number | null }>();
    return {
      quantidadePedidos: Number(resultado?.quantidadePedidos ?? 0),
      faturamento: Number(resultado?.faturamento ?? 0)
    };
  }

   async maisVendidos(filtros: ListarDashboardDto) {
    const consulta = this.filtrar(this.knex('fat_venda as v'), filtros);
    const [{ total }] = await consulta.clone().countDistinct({ total: 'v.itemId' });
    const data: { itemId: number; item: string; categoria: string; quantidade: number; faturamento: number }[] = await consulta
      .innerJoin('dim_item as i', 'i.id', 'v.itemId')
      .select('i.id as itemId', 'i.nome as item', 'i.categoria')
      .sum({ quantidade: 'v.quantidade', faturamento: 'v.valorPago' })
      .groupBy('i.id', 'i.nome', 'i.categoria').orderBy('quantidade', 'desc').orderBy('i.id')
      .offset((filtros.page - 1) * filtros.limit).limit(filtros.limit);
    return { data, total: Number(total), page: filtros.page, limit: filtros.limit };
  }

  async vendasPorLoja(filtros: ListarDashboardDto) {
    const consulta = this.filtrar(this.knex('fat_venda as v'), filtros);
    const [{ total }] = await consulta.clone().countDistinct({ total: 'v.lojaId' });
    const data: { lojaId: number; loja: string; quantidadePedidos: number; faturamento: number }[] = await consulta
      .innerJoin('dim_loja as l', 'l.id', 'v.lojaId')
      .select('l.id as lojaId', 'l.nomeLoja as loja')
      .countDistinct({ quantidadePedidos: 'v.pedidoId' }).sum({ faturamento: 'v.valorPago' })
      .groupBy('l.id', 'l.nomeLoja').orderBy('faturamento', 'desc').orderBy('l.id')
      .offset((filtros.page - 1) * filtros.limit).limit(filtros.limit);
    return { data, total: Number(total), page: filtros.page, limit: filtros.limit };
  }

  async vendasPorDia(filtros: ListarDashboardDto) {
    const consulta = this.filtrar(this.knex('fat_venda as v'), filtros);
    const [{ total }] = await consulta.clone().select(this.knex.raw(`count(distinct ${diaDaVenda}) as total`));
    const data: { dia: string; quantidadePedidos: number; faturamento: number }[] = await consulta
      .select(this.knex.raw(`to_char(${diaDaVenda}, 'YYYY-MM-DD') as dia`))
      .countDistinct({ quantidadePedidos: 'v.pedidoId' }).sum({ faturamento: 'v.valorPago' })
      .groupBy('dia').orderBy('dia')
      .offset((filtros.page - 1) * filtros.limit).limit(filtros.limit);
    return { data, total: Number(total), page: filtros.page, limit: filtros.limit };
  }

  buscarLoja(id: number) {
    return this.knex('dim_loja').where({ id }).first('id');
  }

  private filtrar(consulta: Knex.QueryBuilder, filtros: FiltrosDashboardDto) {
    if (filtros.lojaId !== undefined) consulta.where('v.lojaId', filtros.lojaId);
    if (filtros.de) consulta.whereRaw(`${diaDaVenda} >= ?`, [filtros.de]);
    if (filtros.ate) consulta.whereRaw(`${diaDaVenda} <= ?`, [filtros.ate]);
    return consulta;
  }
}