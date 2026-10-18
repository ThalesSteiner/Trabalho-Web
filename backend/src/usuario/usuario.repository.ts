import { Inject, Injectable } from '@nestjs/common';
import type { Knex } from 'knex';
import { KNEX } from '../common/database/knex.module';
import { ListarUsuariosDto } from './dto/listar-usuarios.dto';
import { Funcionario, Login, Perfil, Usuario } from './usuario.types';

const colunasPerfil = ['u.id', 'u.nome', 'u.cpf', 'l.email', 'l.perfil', 'f.lojaId', 'f.cargo', 'u.criadoEm'];

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

  async lojaExiste(lojaId: number) {
    return !!(await this.knex('dim_loja').where({ id: lojaId }).whereNot('id', -1).first('id'));
  }

  async lojaDoFuncionario(usuarioId: string): Promise<number | undefined> {
    const funcionario = await this.knex('dim_funcionario').where({ usuarioId }).first('lojaId');
    return funcionario?.lojaId;
  }

  criar(usuario: Pick<Usuario, 'nome' | 'cpf'>, login: Omit<Login, 'id' | 'usuarioId'>, funcionario?: Funcionario): Promise<Login> {
    return this.knex.transaction(async (trx) => {
      const [{ id }] = await trx('usuario').insert(usuario).returning('id');
      const [novo] = await trx('login').insert({ ...login, usuarioId: id }).returning('*');
      if (funcionario) await trx('dim_funcionario').insert({ ...funcionario, usuarioId: id, nome: usuario.nome });
      return novo;
    });
  }

  atualizar(
    id: string,
    usuario: Partial<Pick<Usuario, 'nome' | 'cpf'>>,
    login: Partial<Pick<Login, 'email' | 'senhaHash' | 'perfil'>>,
    funcionario: Partial<Funcionario>,
  ) {
    return this.knex.transaction(async (trx) => {
      const preenchido = (dados: object) => Object.values(dados).some((valor) => valor !== undefined);
      if (preenchido(usuario)) await trx('usuario').where({ id }).update(usuario);
      if (preenchido(login)) await trx('login').where({ usuarioId: id }).update(login);

      const { perfil } = await trx('login').where({ usuarioId: id }).first('perfil');
      await this.ajustarVinculos(trx, id, perfil, funcionario);
      if (usuario.nome) {
        await trx('dim_cliente').where({ usuarioId: id }).update({ nome: usuario.nome });
        await trx('dim_funcionario').where({ usuarioId: id }).update({ nome: usuario.nome });
      }
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
    const filtro = this.comPerfil(this.knex('usuario as u'));
    if (nome) filtro.whereILike('u.nome', `%${nome}%`);
    if (email) filtro.whereILike('l.email', `%${email}%`);
    if (perfil) filtro.where('l.perfil', perfil);

    const [{ total }] = await filtro.clone().count({ total: '*' });
    const data = await filtro
      .select(colunasPerfil)
      .orderBy('u.nome')
      .offset((page - 1) * limit)
      .limit(limit);
    return { data, total: Number(total) };
  }

  buscarPerfil(usuarioId: string) {
    return this.comPerfil(this.knex('usuario as u')).where('u.id', usuarioId).first(colunasPerfil);
  }

  private async ajustarVinculos(trx: Knex.Transaction, usuarioId: string, perfil: Perfil, funcionario: Partial<Funcionario>) {
    if (perfil !== 'CLIENTE') await trx('dim_cliente').where({ usuarioId }).update({ usuarioId: null });
    if (perfil !== 'FUNCIONARIO') {
      await trx('dim_funcionario').where({ usuarioId }).update({ usuarioId: null });
      return;
    }

    const atual = await trx('dim_funcionario').where({ usuarioId }).first('id');
    if (atual) {
      if (Object.values(funcionario).some((valor) => valor !== undefined)) {
        await trx('dim_funcionario').where({ id: atual.id }).update(funcionario);
      }
    } else {
      const { nome } = await trx('usuario').where({ id: usuarioId }).first('nome');
      await trx('dim_funcionario').insert({ ...funcionario, usuarioId, nome });
    }
  }

  private comPerfil(consulta: Knex.QueryBuilder) {
    return consulta.join('login as l', 'l.usuarioId', 'u.id').leftJoin('dim_funcionario as f', 'f.usuarioId', 'u.id');
  }
}
