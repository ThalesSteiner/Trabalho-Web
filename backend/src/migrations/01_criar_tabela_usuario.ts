import type { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(`
    create table usuario (
      id         uuid primary key default gen_random_uuid(),
      nome       varchar(120) not null,
      cpf        varchar(11) unique,
      criado_em  timestamptz not null default now()
    )
  `);

  await knex.raw(`alter table usuario enable row level security`);
}

export async function down(knex: Knex) {
  await knex.raw(`drop table usuario`);
}
