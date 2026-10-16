import type { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(`
    create table fat_custo (
      id                  bigint generated always as identity primary key,
      data_custo          date not null,
      loja_id             bigint not null default -1 references dim_loja (id),
      categoria_custo_id  bigint not null references dim_categoria_custo (id),
      descricao           varchar(200),
      valor               numeric(12, 2) not null
    )
  `);

  await knex.raw(`alter table fat_custo enable row level security`);
}

export async function down(knex: Knex) {
  await knex.raw(`drop table fat_custo`);
}
