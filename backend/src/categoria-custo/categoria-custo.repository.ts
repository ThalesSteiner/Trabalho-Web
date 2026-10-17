import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../common/database/knex.module';
import type { CategoriaCusto } from './categoria-custo.types';

@Injectable()
export class CategoriaCustoRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  listar(): Promise<CategoriaCusto[]> {
    return this.knex('dim_categoria_custo').select('id', 'nome').orderBy('nome');
  }

  buscarPorId(id: number): Promise<CategoriaCusto | undefined> {
    return this.knex('dim_categoria_custo').where({ id }).first('id', 'nome');
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
