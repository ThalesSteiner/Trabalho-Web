import type { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(`
    create table fat_compra (
      id                bigint generated always as identity primary key,
      data_recebimento  date not null,
      loja_id           bigint not null references dim_loja (id),
      item_id           bigint not null references dim_item (id),
      fornecedor_id     bigint not null references dim_fornecedor (id),
      funcionario_id    bigint not null default -1 references dim_funcionario (id),
      quantidade        integer not null,
      custo_unitario    numeric(10, 2) not null
    )
  `);

  await knex.raw(`alter table fat_compra enable row level security`);
}

export async function down(knex: Knex) {
  await knex.raw(`drop table fat_compra`);
}
