import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../common/database/knex.module';
import type { CategoriaCusto } from './categoria-custo.types';
import { ListarCategoriasCustoDto } from './dto/listar-categorias-custo.dto';

@Injectable()
export class CategoriaCustoRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async listar(filtros: ListarCategoriasCustoDto) {
    const consulta = this.knex('dim_categoria_custo');

    if (filtros.id !== undefined) consulta.where('id', filtros.id);
    if (filtros.nome) consulta.whereILike('nome', `%${filtros.nome}%`);

    const [{ total }] = await consulta.clone().count({ total: '*' });

    const data: CategoriaCusto[] = await consulta.select('id', 'nome')
      .orderBy('nome').orderBy('id')
      .offset((filtros.page - 1) * filtros.limit).limit(filtros.limit);

    return { data, total: Number(total), page: filtros.page, limit: filtros.limit };
  }

  buscarPorId(id: number): Promise<CategoriaCusto | undefined> {
    return this.knex('dim_categoria_custo').where({ id }).first('id', 'nome');
  }

  buscarPorNome(nome: string): Promise<CategoriaCusto | undefined> {
    return this.knex('dim_categoria_custo').whereRaw('lower(nome) = lower(?)', [nome.trim()]).first('id', 'nome');
  }

  async criar(nome: string): Promise<CategoriaCusto> {
    const [categoria] = await this.knex('dim_categoria_custo').insert({ nome }).returning(['id', 'nome']);
    return categoria;
  }

  async atualizar(id: number, nome: string): Promise<CategoriaCusto | undefined> {
    const [categoria] = await this.knex('dim_categoria_custo').where({ id }).update({ nome }).returning(['id', 'nome']);
    return categoria;
  }

  excluir(id: number): Promise<number> {
    return this.knex('dim_categoria_custo').where({ id }).delete();
  }

  async possuiCustos(id: number): Promise<boolean> {
    const custo = await this.knex('fat_custo').where({ categoriaCustoId: id }).first('id');
    return Boolean(custo);
  }
}
