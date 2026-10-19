import type { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(`
    with repetidas as (
      select id, min(id) over (partition by lower(nome)) as manter
      from dim_categoria_custo
    )
    update fat_custo c set categoria_custo_id = r.manter
    from repetidas r
    where c.categoria_custo_id = r.id and r.id <> r.manter
  `);
  await knex.raw(`
    delete from dim_categoria_custo d
    using dim_categoria_custo o
    where lower(d.nome) = lower(o.nome) and d.id > o.id
  `);
  await knex.raw('create unique index ux_categoria_custo_nome on dim_categoria_custo (lower(nome))');
}

export async function down(knex: Knex) {
  await knex.raw('drop index ux_categoria_custo_nome');
}
