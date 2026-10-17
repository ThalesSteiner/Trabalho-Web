import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import { ListarUsuariosDto } from './dto/listar-usuarios.dto';
import { UsuarioRepository } from './usuario.repository';

@Injectable()
export class UsuarioService {
  constructor(private readonly repository: UsuarioRepository) {}

  async listar(filtros: ListarUsuariosDto) {
    const { data, total } = await this.repository.listar(filtros);
    return { data, total, page: filtros.page, limit: filtros.limit };
  }

  async buscar(id: string) {
    const usuario = await this.repository.buscarPerfil(id);
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    return usuario;
  }

  async atualizar(id: string, { nome, cpf, email, senha, perfil }: AtualizarUsuarioDto) {
    if (!(await this.repository.buscarPerfil(id))) throw new NotFoundException('Usuário não encontrado');
    if (email && (await this.repository.emailExiste(email, id))) throw new ConflictException('Email já cadastrado');
    if (cpf && (await this.repository.cpfExiste(cpf, id))) throw new ConflictException('CPF já cadastrado');

    const usuario = { nome, cpf };
    const login = { email, perfil, senhaHash: senha && (await hash(senha, 10)) };
    if (Object.values({ ...usuario, ...login }).every((valor) => valor === undefined)) {
      throw new BadRequestException('Informe ao menos um campo para atualizar');
    }

    await this.repository.atualizar(id, usuario, login);
    return this.repository.buscarPerfil(id);
  }

  async excluir(id: string) {
    if (!(await this.repository.buscarPerfil(id))) throw new NotFoundException('Usuário não encontrado');
    if (await this.repository.temPagamentos(id)) {
      throw new ConflictException('Usuário possui pagamentos e não pode ser excluído');
    }

    await this.repository.excluir(id);
    return { mensagem: 'Usuário excluído com sucesso' };
  }
}
