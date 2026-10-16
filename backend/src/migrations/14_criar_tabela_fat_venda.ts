import type { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(`
    create table fat_venda (
      id                  bigint generated always as identity primary key,
      data_hora_venda     timestamptz not null,
      loja_id             bigint not null references dim_loja (id),
      item_id             bigint not null references dim_item (id),
      cliente_id          bigint not null default -1 references dim_cliente (id),
      preco_id            bigint not null references dim_preco (id),
      promocao_id         bigint not null default -1 references dim_promocao (id),
      forma_pagamento_id  bigint not null references dim_forma_pagamento (id),
      nota_fiscal_id      bigint not null default -1 references dim_nota_fiscal (id),
      pedido_id           uuid not null,
      quantidade          integer not null,
      valor_pago          numeric(12, 2) not null
    )
  `);

  await knex.raw(`alter table fat_venda enable row level security`);
}

export async function down(knex: Knex) {
  await knex.raw(`drop table fat_venda`);
}
