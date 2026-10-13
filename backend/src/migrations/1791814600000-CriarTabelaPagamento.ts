import { MigrationInterface, QueryRunner } from 'typeorm';

export class CriarTabelaPagamento1791814600000 implements MigrationInterface {
  async up(queryRunner: QueryRunner) {
    await queryRunner.query(`
      alter table dim_nota_fiscal
        add column uuid        uuid not null unique default gen_random_uuid(),
        add column emitida_em  timestamptz,
        add column cancelada   boolean not null default false
    `);

    await queryRunner.query(`
      update dim_nota_fiscal n
      set emitida_em = (select min(v.data_hora_venda) from fat_venda v where v.nota_fiscal_id = n.id)
      where n.id <> -1
    `);

    await queryRunner.query(`create sequence nota_fiscal_numero_seq`);
    await queryRunner.query(`
      select setval('nota_fiscal_numero_seq', coalesce(max(numero::bigint), 0) + 1, false)
      from dim_nota_fiscal
      where id <> -1
    `);

    await queryRunner.query(`
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

    await queryRunner.query(`alter table pagamento enable row level security`);
  }

  async down(queryRunner: QueryRunner) {
    await queryRunner.query(`drop table pagamento`);
    await queryRunner.query(`drop sequence nota_fiscal_numero_seq`);
    await queryRunner.query(`
      alter table dim_nota_fiscal
        drop column cancelada,
        drop column emitida_em,
        drop column uuid
    `);
  }
}
