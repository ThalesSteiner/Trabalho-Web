import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../database/knex.module';
import { Login } from './usuario.types';

@Injectable()
export class UsuarioRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  buscarLoginPorEmail(email: string): Promise<Login | undefined> {
    return this.knex('login').where({ email }).first();
  }
}
