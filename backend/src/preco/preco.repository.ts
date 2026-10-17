import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../common/database/knex.module';
import { ListarPrecosDto } from './dto/listar-precos.dto';
import type { DadosPreco, Preco } from './preco.types';

@Injectable()
export class PrecoRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  transacao<T>(executar: (trx: Knex.Transaction) => Promise<T>) {
    return this.knex.transaction(executar);
  }

  buscarItem(itemId: number, trx: Knex = this.knex) {
    return trx('dim_item').where({ id: itemId }).first('id', 'nome');
  }

  bloquearItem(itemId: number, trx: Knex) {
    return trx('dim_item').where({ id: itemId }).forUpdate().first('id');
  }

  buscarLoja(lojaId: number, trx: Knex = this.knex) {
    return trx('dim_loja').where({ id: lojaId }).first('id');
  }

  buscarPorId(id: number, trx: Knex = this.knex): Promise<Preco | undefined> {
    return trx('dim_preco').where({ id }).first();
  }

  async listar(filtros: ListarPrecosDto) {
    const consulta = this.knex('dim_preco');
    if (filtros.itemId !== undefined) consulta.where('itemId', filtros.itemId);
    if (filtros.lojaId !== undefined) consulta.where('lojaId', filtros.lojaId);
    const [{ total }] = await consulta.clone().count({ total: '*' });
    const data: Preco[] = await consulta.select('*').orderBy('inicioVigencia', 'desc').orderBy('id', 'desc')
      .offset((filtros.page - 1) * filtros.limit).limit(filtros.limit);
    return { data, total: Number(total), page: filtros.page, limit: filtros.limit };
  }

  historico(itemId: number, lojaId?: number): Promise<Preco[]> {
    const consulta = this.knex('dim_preco').where({ itemId });
    if (lojaId !== undefined) consulta.where('lojaId', lojaId);
    return consulta.select('*').orderBy('inicioVigencia', 'asc').orderBy('id', 'asc');
  }

  async encerrarAnteriorAberto(dados: DadosPreco, trx: Knex) {
    return trx('dim_preco').where({ itemId: dados.itemId, lojaId: dados.lojaId })
      .whereNull('fimVigencia').where('inicioVigencia', '<', dados.inicioVigencia)
      .update({ fimVigencia: dados.inicioVigencia });
  }

  vendaDepoisDoNovoInicio(dados: DadosPreco, trx: Knex) {
    return trx('fat_venda as v').innerJoin('dim_preco as p', 'p.id', 'v.precoId')
      .where('p.itemId', dados.itemId).where('p.lojaId', dados.lojaId)
      .whereNull('p.fimVigencia').where('p.inicioVigencia', '<', dados.inicioVigencia)
      .where('v.dataHoraVenda', '>=', dados.inicioVigencia).first('v.id');
  }

  vendaForaDoFim(id: number, fimVigencia: string | Date, trx: Knex) {
    return trx('fat_venda').where({ precoId: id }).where('dataHoraVenda', '>=', fimVigencia).first('id');
  }

  buscarSobreposicao(dados: DadosPreco, trx: Knex, ignorarId?: number) {
    const consulta = trx('dim_preco').where({ itemId: dados.itemId, lojaId: dados.lojaId });
    if (ignorarId !== undefined) consulta.whereNot('id', ignorarId);
    if (dados.fimVigencia !== null) consulta.where('inicioVigencia', '<', dados.fimVigencia);
    return consulta.where(q => q.whereNull('fimVigencia').orWhere('fimVigencia', '>', dados.inicioVigencia)).first('id');
  }

  async criar(dados: DadosPreco, trx: Knex): Promise<Preco> {
    const [preco] = await trx('dim_preco').insert(dados).returning('*');
    return preco;
  }

  async atualizar(id: number, dados: Partial<DadosPreco>, trx: Knex): Promise<Preco> {
    const [preco] = await trx('dim_preco').where({ id }).update(dados).returning('*');
    return preco;
  }

  async possuiVendas(id: number, trx: Knex) {
    return Boolean(await trx('fat_venda').where({ precoId: id }).first('id'));
  }

  excluir(id: number, trx: Knex) {
    return trx('dim_preco').where({ id }).delete();
  }
}
