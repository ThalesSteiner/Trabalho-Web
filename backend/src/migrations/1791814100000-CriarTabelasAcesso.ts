import { MigrationInterface, QueryRunner } from 'typeorm';

export class CriarTabelasAcesso1791814100000 implements MigrationInterface {
  async up(queryRunner: QueryRunner) {
    await queryRunner.query(`
      create table usuario (
        id         uuid primary key default gen_random_uuid(),
        nome       varchar(120) not null,
        cpf        varchar(11) unique,
        criado_em  timestamptz not null default now()
      )
    `);

    await queryRunner.query(`
      create table login (
        id          uuid primary key default gen_random_uuid(),
        usuario_id  uuid not null unique references usuario (id) on delete cascade,
        email       varchar(160) not null unique,
        senha_hash  text not null,
        perfil      varchar(20) not null check (perfil in ('ADMIN', 'CLIENTE', 'FUNCIONARIO'))
      )
    `);
  }

  async down(queryRunner: QueryRunner) {
    await queryRunner.query(`drop table login`);
    await queryRunner.query(`drop table usuario`);
  }
}
