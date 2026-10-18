import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../common/database/knex.module';
import { AtualizarItemDto } from './dto/atualizar-item.dto';
import { CriarItemDto } from './dto/criar-item.dto';
import { ListarItensDto } from './dto/listar-itens.dto';
import { Item } from './item.types';

@Injectable()
export class ItemRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async listar({ page, limit, nome, categoria }: ListarItensDto) {
    const filtro = this.knex('dim_item');
    if (nome) filtro.whereILike('nome', `%${nome}%`);
    if (categoria) filtro.whereILike('categoria', categoria);

    const [{ total }] = await filtro.clone().count({ total: '*' });
    const data: Item[] = await filtro
      .select('id', 'nome', 'categoria')
      .orderBy('nome')
      .offset((page - 1) * limit)
      .limit(limit);
    return { data, total: Number(total) };
  }

  buscarPorId(id: number): Promise<Item | undefined> {
    return this.knex('dim_item').where({ id }).first('id', 'nome', 'categoria');
  }

  async criar(dto: CriarItemDto): Promise<Item> {
    const [item] = await this.knex('dim_item').insert(dto).returning(['id', 'nome', 'categoria']);
    return item;
  }

  async atualizar(id: number, dto: AtualizarItemDto) {
    await this.knex('dim_item').where({ id }).update(dto);
  }

  excluir(id: number) {
    return this.knex('dim_item').where({ id }).delete();
  }
}
