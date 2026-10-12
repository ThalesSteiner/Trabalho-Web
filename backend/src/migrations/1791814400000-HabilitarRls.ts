import { MigrationInterface, QueryRunner } from 'typeorm';

const tabelas = [
  'usuario',
  'login',
  'dim_loja',
  'dim_item',
  'dim_cliente',
  'dim_funcionario',
  'dim_fornecedor',
  'tipo_promocao',
  'dim_promocao',
  'dim_preco',
  'dim_nota_fiscal',
  'dim_forma_pagamento',
  'dim_categoria_custo',
  'fat_venda',
  'fat_compra',
  'fat_estoque',
  'fat_custo',
];

export class HabilitarRls1791814400000 implements MigrationInterface {
  async up(queryRunner: QueryRunner) {
    for (const tabela of tabelas) {
      await queryRunner.query(`alter table ${tabela} enable row level security`);
    }
  }

  async down(queryRunner: QueryRunner) {
    for (const tabela of tabelas) {
      await queryRunner.query(`alter table ${tabela} disable row level security`);
    }
  }
}
