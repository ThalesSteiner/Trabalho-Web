import type { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(`
    create table fat_estoque (
      data_referencia  date not null,
      loja_id          bigint not null references dim_loja (id),
      item_id          bigint not null references dim_item (id),
      lote             varchar(60) not null,
      data_validade    date,
      quantidade       integer not null,
      primary key (data_referencia, loja_id, item_id, lote)
    )
  `);

  await knex.raw(`alter table fat_estoque enable row level security`);
}

export async function down(knex: Knex) {
  await knex.raw(`drop table fat_estoque`);
}
