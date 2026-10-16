import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../database/knex.module';
import { FiltrosDashboardDto } from './dto/filtros-dashboard.dto';
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

    async maisVendidos(filtros: FiltrosDashboardDto, limite: number) {
    const resultados: {
      itemId: number;
      item: string;
      categoria: string;
      quantidade: string | number;
      faturamento: string | number;
    }[] = await this.filtrar(this.knex('fat_venda as v'), filtros)
     .innerJoin('dim_item as i', 'i.id', 'v.itemId')
     .select('i.id as itemId', 'i.nome as item', 'i.categoria')
     .sum({ quantidade: 'v.quantidade', faturamento: 'v.valorPago' })
     .groupBy('i.id', 'i.nome', 'i.categoria').orderBy('quantidade', 'desc').limit(limite);

        return resultados.map(resultado => ({
      ...resultado,
      quantidade: Number(resultado.quantidade),
      faturamento: Number(resultado.faturamento)
    }));
  }
    async vendasPorLoja(filtros: FiltrosDashboardDto) {
    const resultados: {
      lojaId: number;
      loja: string;
      quantidadePedidos: string | number;
      faturamento: string | number;
    }[] = await this.filtrar(this.knex('fat_venda as v'), filtros)
      .innerJoin('dim_loja as l', 'l.id', 'v.lojaId')
      .select('l.id as lojaId', 'l.nomeLoja as loja')
      .countDistinct({ quantidadePedidos: 'v.pedidoId' }).sum({ faturamento: 'v.valorPago' })
      .groupBy('l.id', 'l.nomeLoja').orderBy('faturamento', 'desc');
    return resultados.map(resultado => ({ ...resultado,
      quantidadePedidos: Number(resultado.quantidadePedidos),
      faturamento: Number(resultado.faturamento)
    }));
  }
  async vendasPorDia(filtros: FiltrosDashboardDto) {
    const resultados: {
      dia: string;
      quantidadePedidos: string | number;
      faturamento: string | number;
    }[] = await this.filtrar(this.knex('fat_venda as v'), filtros)
      .select(this.knex.raw(`to_char(${diaDaVenda}, 'YYYY-MM-DD') as dia`))
      .countDistinct({ quantidadePedidos: 'v.pedidoId' }).sum({ faturamento: 'v.valorPago' })
      .groupBy('dia').orderBy('dia');
    return resultados.map(resultado => ({
      ...resultado,
      quantidadePedidos: Number(resultado.quantidadePedidos),
      faturamento: Number(resultado.faturamento)
    }));
  }
  buscarLoja(id: number){
    return this.knex('dim_loja').where({id}).first('id');
  }
    private filtrar(consulta: Knex.QueryBuilder, filtros: FiltrosDashboardDto) {
    if (filtros.lojaId !== undefined) consulta.where('v.lojaId', filtros.lojaId);
    if (filtros.de) consulta.whereRaw(`${diaDaVenda} >= ?`, [filtros.de]);
    if (filtros.ate) consulta.whereRaw(`${diaDaVenda} <= ?`, [filtros.ate]);
    return consulta;
  }
}