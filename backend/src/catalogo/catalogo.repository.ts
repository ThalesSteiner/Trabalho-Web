import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../common/database/knex.module';
import { ListarCatalogoDto } from './dto/listar-catalogo.dto';
import { ListarLojasCatalogoDto } from './dto/listar-lojas-catalogo.dto';

const hoje = "(now() at time zone 'America/Sao_Paulo')::date";

@Injectable()
export class CatalogoRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async lojas({ page, limit, nome, condominio }: ListarLojasCatalogoDto) {
    const filtro = this.knex('dim_loja').where('id', '>', 0);
    if (nome) filtro.whereILike('nomeLoja', `%${nome}%`);
    if (condominio) filtro.whereILike('nomeCondominio', `%${condominio}%`);

    const [{ total }] = await filtro.clone().count({ total: '*' });
    const data = await filtro
      .select('id', 'nomeLoja', 'nomeCondominio')
      .orderBy('nomeLoja')
      .offset((page - 1) * limit)
      .limit(limit);
    return { data, total: Number(total) };
  }

  buscarLoja(id: number) {
    return this.knex('dim_loja').where({ id }).where('id', '>', 0).first('id', 'nomeLoja', 'nomeCondominio');
  }

  // mesmo preço, promoção e estoque que o pagamento usa na hora da compra
  async itens(lojaId: number, { page, limit, nome, categoria, disponiveis }: ListarCatalogoDto) {
    const filtro = this.knex('dim_item as i')
      .joinRaw(
        `join lateral (
          select id, valor from dim_preco
          where item_id = i.id and loja_id in (?, -1)
            and inicio_vigencia <= now() and (fim_vigencia is null or fim_vigencia > now())
          order by loja_id = ? desc limit 1
        ) p on true`,
        [lojaId, lojaId],
      )
      .leftJoin('dim_promocao as pr', function () {
        this.on('pr.itemId', 'i.id').andOnVal('pr.tipoPromocaoId', '<>', 'NENHUMA');
      })
      .leftJoin(
        this.knex('fat_estoque')
          .select('itemId')
          .sum({ quantidade: 'quantidade' })
          .where({ lojaId })
          .whereRaw(`(data_validade is null or data_validade >= ${hoje})`)
          .groupBy('itemId')
          .as('e'),
        'e.itemId',
        'i.id',
      );
    if (nome) filtro.whereILike('i.nome', `%${nome}%`);
    if (categoria) filtro.whereILike('i.categoria', categoria);
    if (disponiveis) filtro.whereRaw('coalesce(e.quantidade, 0) > 0');

    const [{ total }] = await filtro.clone().count({ total: '*' });
    const data = await filtro
      .select(
        'i.id',
        'i.nome',
        'i.categoria',
        'p.valor as preco',
        'pr.tipoPromocaoId as promocaoTipo',
        'pr.nome as promocao',
        'pr.valor as promocaoValor',
        'pr.qtdLeve',
        'pr.qtdPague',
        this.knex.raw('coalesce(e.quantidade, 0)::int as estoque'),
      )
      .orderBy('i.categoria')
      .orderBy('i.nome')
      .offset((page - 1) * limit)
      .limit(limit);
    return { data, total: Number(total) };
  }
}
