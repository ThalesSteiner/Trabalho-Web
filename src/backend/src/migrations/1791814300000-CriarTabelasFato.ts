import { MigrationInterface, QueryRunner } from 'typeorm';

export class CriarTabelasFato1791814300000 implements MigrationInterface {
  async up(queryRunner: QueryRunner) {
    await queryRunner.query(`
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

    await queryRunner.query(`
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

    await queryRunner.query(`
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

    await queryRunner.query(`
      create table fat_custo (
        id                  bigint generated always as identity primary key,
        data_custo          date not null,
        loja_id             bigint not null default -1 references dim_loja (id),
        categoria_custo_id  bigint not null references dim_categoria_custo (id),
        descricao           varchar(200),
        valor               numeric(12, 2) not null
      )
    `);
  }

  async down(queryRunner: QueryRunner) {
    await queryRunner.query(`drop table fat_custo`);
    await queryRunner.query(`drop table fat_estoque`);
    await queryRunner.query(`drop table fat_compra`);
    await queryRunner.query(`drop table fat_venda`);
  }
}
