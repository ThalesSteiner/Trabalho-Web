import {Inject, Injectable} from '@nestjs/common';
import type {Knex} from 'knex';
import { KNEX } from '../common/database/knex.module';
import type { Loja } from './loja.types';
import {CriarLojaDto } from './dto/criar-loja.dto';
import { AtualizarLojaDto } from './dto/atualizar-loja.dto';
import { ListarLojasDto } from './dto/filtros-loja.dto';

@Injectable()
export class LojaRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}
async criar(dto: CriarLojaDto): Promise<Loja> {
    const [loja] = await this.knex('dim_loja').insert(dto).returning('*');
    return loja;
  }

  async listar(filtros: ListarLojasDto) {
    const consulta = this.filtrar(this.knex('dim_loja as l').where('l.id', '>', 0), filtros);
    const [{ total }] = await consulta.clone().count({ total: '*' });
    const data: Loja[] = await consulta.select('l.*')
      .orderBy('l.nomeLoja').orderBy('l.id')
      .offset((filtros.page - 1) * filtros.limit).limit(filtros.limit);
    return { data, total: Number(total), page: filtros.page, limit: filtros.limit };
  }
   buscarPorId(id: number): Promise<Loja | undefined> {
    return this.knex('dim_loja').where({ id }).first();
  }

  buscarMesmoNome(nomeLoja: string, nomeCondominio: string | null, ignorarId?: number) {
    const consulta = this.knex('dim_loja').whereRaw('lower(nome_loja) = lower(?)', [nomeLoja]);

    if (nomeCondominio) {
      consulta.whereRaw('lower(nome_condominio) = lower(?)', [nomeCondominio]);
    } else {
      consulta.whereNull('nomeCondominio');
    }

    if (ignorarId !== undefined) {
      consulta.whereNot({ id: ignorarId });
    }

    return consulta.first('id');
  }
  async atualizar(id: number, dto: AtualizarLojaDto): Promise<Loja | undefined> {
    const [loja] = await this.knex('dim_loja').where({ id }).update(dto).returning('*');
    return loja;
  }

  excluir(id: number): Promise<number> {
    return this.knex('dim_loja').where({ id }).delete();
  }

  private filtrar(consulta: Knex.QueryBuilder, filtros: ListarLojasDto) {
    if (filtros.nome) {
      consulta.whereILike('l.nomeLoja', `%${filtros.nome}%`);
    }

    if (filtros.condominio) {
      consulta.whereILike('l.nomeCondominio', `%${filtros.condominio}%`);
    }

    return consulta;
  }
}