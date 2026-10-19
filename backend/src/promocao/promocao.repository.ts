import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../common/database/knex.module';
import { ListarPromocoesDto, ListarTiposPromocaoDto } from './dto/listar-promocoes.dto';
import type { DadosPromocao, Promocao } from './promocao.types';

@Injectable()
export class PromocaoRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  transacao<T>(executar: (trx: Knex.Transaction) => Promise<T>) {
    return this.knex.transaction(executar);
  }

  async tipos(filtros: ListarTiposPromocaoDto) {
    const consulta = this.knex('tipo_promocao');
    if (filtros.id !== undefined) consulta.where('id', filtros.id);
    if (filtros.nome) consulta.whereILike('nome', `%${filtros.nome}%`);
    const [{ total }] = await consulta.clone().count({ total: '*' });
    const data = await consulta.select('id', 'nome').orderBy('nome').orderBy('id')
      .offset((filtros.page - 1) * filtros.limit).limit(filtros.limit);
    return { data, total: Number(total), page: filtros.page, limit: filtros.limit };
  }

  async listar(filtros: ListarPromocoesDto) {
    const consulta = this.knex('dim_promocao').whereNot('tipoPromocaoId', 'NENHUMA');
    if (filtros.itemId !== undefined) consulta.where('itemId', filtros.itemId);
    if (filtros.tipoPromocaoId) consulta.where('tipoPromocaoId', filtros.tipoPromocaoId);
    const [{ total }] = await consulta.clone().count({ total: '*' });
    const data: Promocao[] = await consulta.select('*').orderBy('id', 'desc')
      .offset((filtros.page - 1) * filtros.limit).limit(filtros.limit);
    return { data, total: Number(total), page: filtros.page, limit: filtros.limit };
  }

  buscarPorId(id: number, trx: Knex = this.knex): Promise<Promocao | undefined> {
    return trx('dim_promocao').where({ id }).whereNot('tipoPromocaoId', 'NENHUMA').first();
  }

  bloquearItem(itemId: number, trx: Knex) {
    return trx('dim_item').where({ id: itemId }).forUpdate().first('id');
  }

  buscarPorItem(itemId: number, trx: Knex) {
    return trx('dim_promocao').where({ itemId }).whereNot('tipoPromocaoId', 'NENHUMA').first('id');
  }

  async criar(dados: DadosPromocao, trx: Knex): Promise<Promocao> {
    const [promocao] = await trx('dim_promocao').insert(dados).returning('*');
    return promocao;
  }

  async atualizar(id: number, dados: DadosPromocao, trx: Knex): Promise<Promocao> {
    const [promocao] = await trx('dim_promocao').where({ id }).update(dados).returning('*');
    return promocao;
  }

  async possuiVendas(id: number, trx: Knex) {
    return Boolean(await trx('fat_venda').where({ promocaoId: id }).first('id'));
  }

  excluir(id: number, trx: Knex) {
    return trx('dim_promocao').where({ id }).delete();
  }
}