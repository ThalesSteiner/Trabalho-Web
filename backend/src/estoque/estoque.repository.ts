import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../common/database/knex.module';
import type { LoteEstoque } from './estoque.types';
import { ListarEstoqueDto, RelatorioEstoqueDto } from './dto/filtros-estoque.dto';

const diaDaVenda = "(v.data_hora_venda at time zone 'America/Sao_Paulo')::date";

@Injectable()
export class EstoqueRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}
  async listar(filtros: ListarEstoqueDto) {
    const consulta = this.filtrar(this.knex('fat_estoque as e'), filtros);
    const [{ total }] = await consulta.clone().count({ total: '*' });
    const data: {
      lojaId: number;
      loja: string;
      itemId: number;
      item: string;
      lote: string;
      quantidade: number;
      dataValidade: string | null;
      dataReferencia: string;
    }[] = await consulta
      .innerJoin('dim_loja as l', 'l.id', 'e.lojaId')
      .innerJoin('dim_item as i', 'i.id', 'e.itemId')
      .select(
        'e.lojaId', 'l.nomeLoja as loja', 'e.itemId', 'i.nome as item', 'e.lote', 'e.quantidade',
        this.knex.raw(`to_char(e.data_validade, 'YYYY-MM-DD') as data_validade`),
        this.knex.raw(`to_char(e.data_referencia, 'YYYY-MM-DD') as data_referencia`)
      )
      .orderByRaw('e.data_validade asc nulls last').orderBy('e.lojaId').orderBy('e.itemId').orderBy('e.lote')
      .offset((filtros.page - 1) * filtros.limit).limit(filtros.limit);
    return { data, total: Number(total), page: filtros.page, limit: filtros.limit };
  }
  buscarLoja(id: number) {
    return this.knex('dim_loja').where({ id }).first('id');
  }

  buscarItem(id: number) {
    return this.knex('dim_item').where({ id }).first('id');
  }

  buscarLote(lojaId: number, itemId: number, lote: string): Promise<LoteEstoque | undefined> {
    return this.selecionarLotes().where({ lojaId, itemId, lote }).first();
  }

  buscarLoteDoDia(dataReferencia: string, lojaId: number, itemId: number, lote: string): Promise<LoteEstoque | undefined> {
    return this.selecionarLotes().where({ dataReferencia, lojaId, itemId, lote }).first();
  }

  listarLotesDoItem(lojaId: number, itemId: number): Promise<LoteEstoque[]> {
    return this.selecionarLotes().where({ lojaId, itemId }).where('quantidade', '>', 0)
      .orderByRaw('data_validade asc nulls last').orderBy('dataReferencia').orderBy('lote');
  }
  async registrarEntrada(lote: LoteEstoque) {
    await this.knex('fat_estoque').insert(lote)
      .onConflict(['dataReferencia', 'lojaId', 'itemId', 'lote'])
      .merge({ quantidade: this.knex.raw('fat_estoque.quantidade + excluded.quantidade') });
  }

  async aplicarBaixa(lojaId: number, itemId: number, retiradas: { dataReferencia: string; lote: string; quantidade: number }[]) {
    await this.knex.transaction(async trx => {
      for (const retirada of retiradas) {
        await trx('fat_estoque')
          .where({ dataReferencia: retirada.dataReferencia, lojaId, itemId, lote: retirada.lote })
          .decrement('quantidade', retirada.quantidade);
      }
      await trx('fat_estoque').where({ lojaId, itemId }).where('quantidade', '<=', 0).delete();
    });
  }
  async listarVencidos(lojaId: number, hoje: string) {
    const vencidos: {
      itemId: number;
      item: string;
      lote: string;
      quantidade: number;
      dataValidade: string;
      custoMedio: number;
    }[] = await this.knex('fat_estoque as e')
      .innerJoin('dim_item as i', 'i.id', 'e.itemId')
      .leftJoin(this.custoMedio().as('cm'), function () {
        this.on('cm.lojaId', 'e.lojaId').andOn('cm.itemId', 'e.itemId');
      })
      .where('e.lojaId', lojaId).where('e.dataValidade', '<', hoje)
      .select(
        'e.itemId', 'i.nome as item', 'e.lote', 'e.quantidade',
        this.knex.raw(`to_char(e.data_validade, 'YYYY-MM-DD') as data_validade`),
        this.knex.raw('coalesce(cm.custo_medio, 0) as custo_medio')
      )
      .orderBy('e.dataValidade').orderBy('e.itemId').orderBy('e.lote');
    return vencidos;
  }

  removerVencidos(lojaId: number, hoje: string): Promise<number> {
    return this.knex('fat_estoque').where({ lojaId }).where('dataValidade', '<', hoje).delete();
  }
  async valorPorLoja(filtros: RelatorioEstoqueDto, hoje: string) {
    const consulta = this.estoqueDentroDaValidade(filtros, hoje);
    const [{ total }] = await consulta.clone().countDistinct({ total: 'e.lojaId' });
    const data: {
      lojaId: number;
      loja: string;
      quantidade: number;
      valor: number;
    }[] = await consulta
      .innerJoin('dim_loja as l', 'l.id', 'e.lojaId')
      .leftJoin(this.custoMedio().as('cm'), function () {
        this.on('cm.lojaId', 'e.lojaId').andOn('cm.itemId', 'e.itemId');
      })
      .select(
        'l.id as lojaId', 'l.nomeLoja as loja',
        this.knex.raw('round(sum(e.quantidade * coalesce(cm.custo_medio, 0)), 2) as valor')
      )
      .sum({ quantidade: 'e.quantidade' })
      .groupBy('l.id', 'l.nomeLoja').orderBy('valor', 'desc').orderBy('l.id')
      .offset((filtros.page - 1) * filtros.limit).limit(filtros.limit);
    return { data, total: Number(total), page: filtros.page, limit: filtros.limit };
  }
  async cobertura(filtros: RelatorioEstoqueDto, hoje: string, inicio: string, dias: number) {
    const consulta = this.estoqueDentroDaValidade(filtros, hoje);
    const [{ total }] = await consulta.clone().select(this.knex.raw('count(distinct (e.loja_id, e.item_id)) as total'));
    const vendas = this.knex('fat_venda as v')
      .select('v.lojaId', 'v.itemId').sum({ vendido: 'v.quantidade' })
      .whereRaw(`${diaDaVenda} >= ?`, [inicio]).whereRaw(`${diaDaVenda} < ?`, [hoje])
      .groupBy('v.lojaId', 'v.itemId');
    const data: {
      lojaId: number;
      loja: string;
      itemId: number;
      item: string;
      estoque: number;
      mediaDiaria: number;
      diasCobertura: number | null;
    }[] = await consulta
      .innerJoin('dim_loja as l', 'l.id', 'e.lojaId')
      .leftJoin(vendas.as('vd'), function () {
        this.on('vd.lojaId', 'e.lojaId').andOn('vd.itemId', 'e.itemId');
      })
      .select(
        'e.lojaId', 'l.nomeLoja as loja', 'e.itemId', 'i.nome as item',
        this.knex.raw('round(coalesce(vd.vendido, 0)::numeric / ?, 2) as media_diaria', [dias]),
        this.knex.raw(
          'case when coalesce(vd.vendido, 0) = 0 then null else round(sum(e.quantidade) / (vd.vendido::numeric / ?), 1) end as dias_cobertura',
          [dias]
        )
      )
      .sum({ estoque: 'e.quantidade' })
      .groupBy('e.lojaId', 'l.nomeLoja', 'e.itemId', 'i.nome', 'vd.vendido')
      .orderByRaw('dias_cobertura asc nulls last').orderBy('e.lojaId').orderBy('e.itemId')
      .offset((filtros.page - 1) * filtros.limit).limit(filtros.limit);
    return { data, total: Number(total), page: filtros.page, limit: filtros.limit };
  }
  private custoMedio() {
    return this.knex('fat_compra')
      .select('lojaId', 'itemId')
      .select(this.knex.raw('sum(quantidade * custo_unitario) / sum(quantidade) as custo_medio'))
      .groupBy('lojaId', 'itemId');
  }

  private estoqueDentroDaValidade(filtros: RelatorioEstoqueDto, hoje: string): Knex.QueryBuilder {
    const consulta = this.knex('fat_estoque as e')
      .innerJoin('dim_item as i', 'i.id', 'e.itemId')
      .where(function () {
        this.whereNull('e.dataValidade').orWhere('e.dataValidade', '>=', hoje);
      });
    if (filtros.lojaId !== undefined) consulta.where('e.lojaId', filtros.lojaId);
    if (filtros.categoria) consulta.where('i.categoria', filtros.categoria);
    return consulta;
  }

  private selecionarLotes() {
    return this.knex('fat_estoque').select(
      this.knex.raw(`to_char(data_referencia, 'YYYY-MM-DD') as data_referencia`),
      'lojaId', 'itemId', 'lote', 'quantidade',
      this.knex.raw(`to_char(data_validade, 'YYYY-MM-DD') as data_validade`)
    );
  }

  private filtrar(consulta: Knex.QueryBuilder, filtros: ListarEstoqueDto) {
    if (filtros.lojaId !== undefined) consulta.where('e.lojaId', filtros.lojaId);
    if (filtros.itemId !== undefined) consulta.where('e.itemId', filtros.itemId);
    if (filtros.validadeAte) consulta.where('e.dataValidade', '<=', filtros.validadeAte);
    return consulta;
  }
}
 