import type { Knex } from 'knex';

const unicos = [
  `create unique index ux_loja_nome on dim_loja (lower(nome_loja), lower(coalesce(nome_condominio, '')))`,
  'create unique index ux_cliente_usuario on dim_cliente (usuario_id)',
  'create unique index ux_funcionario_usuario on dim_funcionario (usuario_id)',
  'create unique index ux_fornecedor_cnpj on dim_fornecedor (cnpj)',
  'create unique index ux_nota_fiscal_numero on dim_nota_fiscal (numero)',
  'create unique index ux_nota_fiscal_chave on dim_nota_fiscal (chave_acesso)',
  `create unique index ux_promocao_item on dim_promocao (item_id) where tipo_promocao_id <> 'NENHUMA'`,
];

const indices = [
  'create index ix_venda_loja_data on fat_venda (loja_id, data_hora_venda)',
  'create index ix_venda_item on fat_venda (item_id)',
  'create index ix_venda_pedido on fat_venda (pedido_id)',
  'create index ix_venda_nota on fat_venda (nota_fiscal_id)',
  'create index ix_compra_loja_item on fat_compra (loja_id, item_id)',
  'create index ix_compra_fornecedor on fat_compra (fornecedor_id)',
  'create index ix_estoque_loja_item on fat_estoque (loja_id, item_id)',
  'create index ix_custo_loja_data on fat_custo (loja_id, data_custo)',
  'create index ix_custo_categoria on fat_custo (categoria_custo_id)',
  'create index ix_preco_item_loja on dim_preco (item_id, loja_id)',
  'create index ix_pagamento_usuario on pagamento (usuario_id)',
  'create index ix_pagamento_nota on pagamento (nota_fiscal_id)',
];

const nome = (sql: string) => sql.split(' ')[sql.includes('unique') ? 3 : 2];

export async function up(knex: Knex) {
  for (const sql of [...unicos, ...indices]) await knex.raw(sql);
}

export async function down(knex: Knex) {
  for (const sql of [...unicos, ...indices]) await knex.raw(`drop index ${nome(sql)}`);
}
