import type { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(`
    create table login (
      id          uuid primary key default gen_random_uuid(),
      usuario_id  uuid not null unique references usuario (id) on delete cascade,
      email       varchar(160) not null unique,
      senha_hash  text not null,
      perfil      varchar(20) not null check (perfil in ('ADMIN', 'CLIENTE', 'FUNCIONARIO'))
    )
  `);

  await knex.raw(`alter table login enable row level security`);
}

export async function down(knex: Knex) {
  await knex.raw(`drop table login`);
}
