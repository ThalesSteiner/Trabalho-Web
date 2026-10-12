import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../database/knex.module';
import { Login, Usuario } from './usuario.types';

@Injectable()
export class UsuarioRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  buscarLoginPorEmail(email: string): Promise<Login | undefined> {
    return this.knex('login').where({ email }).first();
  }

  async emailExiste(email: string) {
    return !!(await this.knex('login').where({ email }).first('id'));
  }

  async cpfExiste(cpf: string) {
    return !!(await this.knex('usuario').where({ cpf }).first('id'));
  }

  criar(usuario: Pick<Usuario, 'nome' | 'cpf'>, login: Omit<Login, 'id' | 'usuarioId'>): Promise<Login> {
    return this.knex.transaction(async (trx) => {
      const [{ id }] = await trx('usuario').insert(usuario).returning('id');
      const [novo] = await trx('login').insert({ ...login, usuarioId: id }).returning('*');
      return novo;
    });
  }

  buscarPerfil(usuarioId: string) {
    return this.knex('usuario as u')
      .join('login as l', 'l.usuarioId', 'u.id')
      .where('u.id', usuarioId)
      .first('u.id', 'u.nome', 'u.cpf', 'l.email', 'l.perfil', 'u.criadoEm');
  }
}
