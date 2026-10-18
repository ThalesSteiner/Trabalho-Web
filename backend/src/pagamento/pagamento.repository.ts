import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../common/database/knex.module';
import { ListarFormasDto } from './dto/listar-formas.dto';
import { ListarPagamentosDto } from './dto/listar-pagamentos.dto';
import { NovoPagamento, Pagamento } from './pagamento.types';

export type Promocao = { id: number; tipo: string; valor: number | null; leve: number | null; pague: number | null };

@Injectable()
export class PagamentoRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  transacao<T>(executar: (trx: Knex.Transaction) => Promise<T>) {
    return this.knex.transaction(executar);
  }

  async criar(pagamento: NovoPagamento): Promise<Pagamento> {
    const [novo] = await this.knex('pagamento')
      .insert({ ...pagamento, itens: JSON.stringify(pagamento.itens) })
      .returning('*');
    return novo;
  }

  async atualizar(id: string, dados: Partial<Pagamento>, trx: Knex = this.knex) {
    await trx('pagamento').where({ id }).update(dados);
  }

  buscarPorId(id: string, trx: Knex = this.knex) {
    return this.comNota(trx('pagamento as p')).where('p.id', id).first();
  }

  async listar({ page, limit, status, lojaId, formaPagamentoId, de, ate }: ListarPagamentosDto, usuarioId?: string) {
    const filtro = this.knex('pagamento as p');
    if (usuarioId) filtro.where('p.usuarioId', usuarioId);
    if (status) filtro.where('p.status', status);
    if (lojaId) filtro.where('p.lojaId', lojaId);
    if (formaPagamentoId) filtro.where('p.formaPagamentoId', formaPagamentoId);
    if (de) filtro.whereRaw("p.criado_em >= (?::date)::timestamp at time zone 'America/Sao_Paulo'", [de]);
    if (ate) filtro.whereRaw("p.criado_em < (?::date + 1)::timestamp at time zone 'America/Sao_Paulo'", [ate]);

    const [{ total }] = await filtro.clone().count({ total: '*' });
    const data = await this.comNota(filtro)
      .orderBy('p.criadoEm', 'desc')
      .offset((page - 1) * limit)
      .limit(limit);
    return { data, total: Number(total) };
  }

  async formas({ page, limit, id, nome }: ListarFormasDto) {
    const filtro = this.knex('dim_forma_pagamento');
    if (id) filtro.where({ id });
    if (nome) filtro.whereILike('nome', `%${nome}%`);

    const [{ total }] = await filtro.clone().count({ total: '*' });
    const data: { id: number; nome: string }[] = await filtro
      .select('id', 'nome')
      .orderBy('id')
      .offset((page - 1) * limit)
      .limit(limit);
    return { data, total: Number(total) };
  }

  buscarLoja(id: number): Promise<{ id: number; nome: string } | undefined> {
    return this.knex('dim_loja').where({ id }).whereNot('id', -1).first('id', 'nomeLoja as nome');
  }

  buscarForma(id: number): Promise<{ id: number; nome: string } | undefined> {
    return this.knex('dim_forma_pagamento').where({ id }).first('id', 'nome');
  }

  precoVigente(itemId: number, lojaId: number): Promise<{ id: number; valor: number } | undefined> {
    return this.knex('dim_preco')
      .where({ itemId })
      .whereIn('lojaId', [lojaId, -1])
      .where('inicioVigencia', '<=', this.knex.fn.now())
      .where((q) => q.whereNull('fimVigencia').orWhere('fimVigencia', '>', this.knex.fn.now()))
      .orderByRaw('loja_id = ? desc', [lojaId])
      .first('id', 'valor');
  }

  promocaoDoItem(itemId: number): Promise<Promocao | undefined> {
    return this.knex('dim_promocao')
      .where({ itemId })
      .whereNot('tipoPromocaoId', 'NENHUMA')
      .first('id', 'tipoPromocaoId as tipo', 'valor', 'qtdLeve as leve', 'qtdPague as pague');
  }

  async clienteDoUsuario(usuarioId: string, trx: Knex): Promise<number> {
    const cliente = await trx('dim_cliente').where({ usuarioId }).first('id');
    if (cliente) return cliente.id;

    const usuario = await trx('usuario').where({ id: usuarioId }).first('nome');
    const [novo] = await trx('dim_cliente').insert({ usuarioId, nome: usuario.nome }).returning('id');
    return novo.id;
  }

  async registrarVenda(pagamento: Pagamento, clienteId: number, notaFiscalId: number, trx: Knex) {
    await trx('fat_venda').insert(
      pagamento.itens.map((item) => ({
        dataHoraVenda: pagamento.processadoEm,
        lojaId: pagamento.lojaId,
        itemId: item.itemId,
        clienteId,
        precoId: item.precoId,
        promocaoId: item.promocaoId,
        formaPagamentoId: pagamento.formaPagamentoId,
        notaFiscalId,
        pedidoId: pagamento.id,
        quantidade: item.quantidade,
        valorPago: item.valorPago,
      })),
    );
  }

  async removerVenda(pedidoId: string, trx: Knex) {
    await trx('fat_venda').where({ pedidoId }).delete();
  }

  async excluir(id: string, trx: Knex) {
    await trx('pagamento').where({ id }).delete();
  }

  private comNota(consulta: Knex.QueryBuilder) {
    return consulta
      .leftJoin('dim_nota_fiscal as n', 'n.id', 'p.notaFiscalId')
      .select('p.*', 'n.uuid as notaUuid', 'n.numero as notaNumero', 'n.chaveAcesso as notaChave');
  }
}
