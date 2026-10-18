import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../common/database/knex.module';
import type { Custo } from './custo.types';
import { CriarCustoDto } from './dto/criar-custo.dto';
import { AtualizarCustoDto } from './dto/atualizar-custo.dto';
import { FiltrosCustoDto, ListarCustosDto } from './dto/filtros-custo.dto';

@Injectable()
export class CustoRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async criar(dto: CriarCustoDto): Promise<Custo> {
    const [custo] = await this.knex('fat_custo').insert(dto).returning('*');
    return custo;
  }

  async listar(filtros: ListarCustosDto) {
    const consulta = this.filtrar(this.knex('fat_custo as c'), filtros);
    const [{ total }] = await consulta.clone().count({ total: '*' });
    const data: Custo[] = await consulta.select('c.*')
      .orderBy('c.dataCusto', 'desc').orderBy('c.id', 'desc')
      .offset((filtros.page - 1) * filtros.limit).limit(filtros.limit);
    return { data, total: Number(total), page: filtros.page, limit: filtros.limit };
  }

  buscarPorId(id: number): Promise<Custo | undefined> {
    return this.knex('fat_custo').where({ id }).first();
  }

  async atualizar(id: number, dto: AtualizarCustoDto): Promise<Custo | undefined> {
    const [custo] = await this.knex('fat_custo').where({ id }).update(dto).returning('*');
    return custo;
  }

  excluir(id: number): Promise<number> {
    return this.knex('fat_custo').where({ id }).delete();
  }

  buscarLoja(id: number) {
    return this.knex('dim_loja').where({ id }).first('id');
  }

  buscarCategoria(id: number) {
    return this.knex('dim_categoria_custo').where({ id }).first('id');
  }

  async resumo(filtros: FiltrosCustoDto) {
    const resultado = await this.filtrar(this.knex('fat_custo as c'), filtros)
      .count({ quantidadeDespesas: '*' }).sum({ totalGasto: 'c.valor' })
      .first<{ quantidadeDespesas: string | number; totalGasto: string | number | null }>();
    return {
      quantidadeDespesas: Number(resultado?.quantidadeDespesas ?? 0),
      totalGasto: Number(resultado?.totalGasto ?? 0)
    };
  }

  async resumoPorCategoria(filtros: ListarCustosDto) {
    const consulta = this.filtrar(this.knex('fat_custo as c'), filtros)
      .innerJoin('dim_categoria_custo as cat', 'cat.id', 'c.categoriaCustoId');

    const [{ total }] = await consulta.clone().countDistinct({ total: 'cat.id' });

    const resultados: {
      categoriaCustoId: number;
      categoria: string;
      quantidadeDespesas: string | number;
      totalGasto: string | number;
    }[] = await consulta
      .select('cat.id as categoriaCustoId', 'cat.nome as categoria')
      .count({ quantidadeDespesas: 'c.id' })
      .sum({ totalGasto: 'c.valor' })
      .groupBy('cat.id', 'cat.nome')
      .orderBy('cat.nome').orderBy('cat.id')
      .offset((filtros.page - 1) * filtros.limit).limit(filtros.limit);

    const data = resultados.map(resultado => ({
      ...resultado,
      quantidadeDespesas: Number(resultado.quantidadeDespesas),
      totalGasto: Number(resultado.totalGasto)
    }));

    return { data, total: Number(total), page: filtros.page, limit: filtros.limit };
  }

  private filtrar(consulta: Knex.QueryBuilder, filtros: FiltrosCustoDto) {
    if (filtros.lojaId !== undefined) consulta.where('c.lojaId', filtros.lojaId);
    if (filtros.categoriaCustoId !== undefined) consulta.where('c.categoriaCustoId', filtros.categoriaCustoId);
    if (filtros.de) consulta.where('c.dataCusto', '>=', filtros.de);
    if (filtros.ate) consulta.where('c.dataCusto', '<=', filtros.ate);
    return consulta;
  }
}
