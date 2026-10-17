import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../common/database/knex.module';
import { ListarUsuariosDto } from './dto/listar-usuarios.dto';
import { Login, Usuario } from './usuario.types';

@Injectable()
export class UsuarioRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  buscarLoginPorEmail(email: string): Promise<Login | undefined> {
    return this.knex('login').where({ email }).first();
  }

  async emailExiste(email: string, ignorarUsuarioId?: string) {
    const consulta = this.knex('login').where({ email });
    if (ignorarUsuarioId) consulta.whereNot('usuarioId', ignorarUsuarioId);
    return !!(await consulta.first('id'));
  }

  async cpfExiste(cpf: string, ignorarUsuarioId?: string) {
    const consulta = this.knex('usuario').where({ cpf });
    if (ignorarUsuarioId) consulta.whereNot('id', ignorarUsuarioId);
    return !!(await consulta.first('id'));
  }

  criar(usuario: Pick<Usuario, 'nome' | 'cpf'>, login: Omit<Login, 'id' | 'usuarioId'>): Promise<Login> {
    return this.knex.transaction(async (trx) => {
      const [{ id }] = await trx('usuario').insert(usuario).returning('id');
      const [novo] = await trx('login').insert({ ...login, usuarioId: id }).returning('*');
      return novo;
    });
  }

  atualizar(id: string, usuario: Partial<Pick<Usuario, 'nome' | 'cpf'>>, login: Partial<Pick<Login, 'email' | 'senhaHash' | 'perfil'>>) {
    return this.knex.transaction(async (trx) => {
      if (Object.values(usuario).some((valor) => valor !== undefined)) await trx('usuario').where({ id }).update(usuario);
      if (Object.values(login).some((valor) => valor !== undefined)) await trx('login').where({ usuarioId: id }).update(login);
    });
  }

  async temPagamentos(usuarioId: string) {
    return !!(await this.knex('pagamento').where({ usuarioId }).first('id'));
  }

  excluir(id: string) {
    return this.knex.transaction(async (trx) => {
      await trx('dim_cliente').where({ usuarioId: id }).update({ usuarioId: null });
      await trx('dim_funcionario').where({ usuarioId: id }).update({ usuarioId: null });
      await trx('usuario').where({ id }).delete();
    });
  }

  async listar({ page, limit, nome, email, perfil }: ListarUsuariosDto) {
    const filtro = this.knex('usuario as u').join('login as l', 'l.usuarioId', 'u.id');
    if (nome) filtro.whereILike('u.nome', `%${nome}%`);
    if (email) filtro.whereILike('l.email', `%${email}%`);
    if (perfil) filtro.where('l.perfil', perfil);

    const [{ total }] = await filtro.clone().count({ total: '*' });
    const data = await filtro
      .select('u.id', 'u.nome', 'u.cpf', 'l.email', 'l.perfil', 'u.criadoEm')
      .orderBy('u.nome')
      .offset((page - 1) * limit)
      .limit(limit);
    return { data, total: Number(total) };
  }

  buscarPerfil(usuarioId: string) {
    return this.knex('usuario as u')
      .join('login as l', 'l.usuarioId', 'u.id')
      .where('u.id', usuarioId)
      .first('u.id', 'u.nome', 'u.cpf', 'l.email', 'l.perfil', 'u.criadoEm');
  }
}
