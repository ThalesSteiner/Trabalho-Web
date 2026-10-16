import type { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(`
    create table pagamento (
      id                  uuid primary key default gen_random_uuid(),
      usuario_id          uuid not null references usuario (id),
      loja_id             bigint not null references dim_loja (id),
      forma_pagamento_id  bigint not null references dim_forma_pagamento (id),
      nota_fiscal_id      bigint references dim_nota_fiscal (id),
      itens               jsonb not null,
      valor               numeric(12, 2) not null,
      status              varchar(20) not null default 'PENDENTE'
                          check (status in ('PENDENTE', 'APROVADO', 'RECUSADO', 'ESTORNADO')),
      codigo_transacao    varchar(60),
      motivo              varchar(200),
      criado_em           timestamptz not null default now(),
      processado_em       timestamptz
    )
  `);

  await knex.raw(`alter table pagamento enable row level security`);
}

export async function down(knex: Knex) {
  await knex.raw(`drop table pagamento`);
}
