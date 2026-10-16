import type { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(`
    create table tipo_promocao (
      id    varchar(20) primary key,
      nome  varchar(60) not null
    )
  `);

  await knex.raw(`
    insert into tipo_promocao (id, nome) values
      ('DESCONTO',   'Desconto %'),
      ('DINHEIRO',   'Desconto em R$'),
      ('PRECO_FIXO', 'Preço fixo'),
      ('LEVE_PAGUE', 'Leve X pague Y'),
      ('NENHUMA',    'Sem promoção')
  `);

  await knex.raw(`alter table tipo_promocao enable row level security`);
}

export async function down(knex: Knex) {
  await knex.raw(`drop table tipo_promocao`);
}
