import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';
import { ListarUsuariosDto } from './dto/listar-usuarios.dto';
import { UsuarioRepository } from './usuario.repository';
import { Perfil } from './usuario.types';

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

  async criar({ nome, cpf, email, senha, perfil, lojaId, cargo }: CriarUsuarioDto) {
    if (await this.repository.emailExiste(email)) throw new ConflictException('Email já cadastrado');
    if (cpf && (await this.repository.cpfExiste(cpf))) throw new ConflictException('CPF já cadastrado');
    if (lojaId && !(await this.repository.lojaExiste(lojaId))) throw new NotFoundException('Loja não encontrada');

    const senhaHash = await hash(senha, 10);
    const funcionario = perfil === 'FUNCIONARIO' ? { lojaId: lojaId!, cargo } : undefined;
    const login = await this.repository.criar({ nome, cpf: cpf ?? null }, { email, senhaHash, perfil }, funcionario);
    return this.repository.buscarPerfil(login.usuarioId);
  }

  async atualizar(id: string, { nome, cpf, email, senha, perfil, lojaId, cargo }: AtualizarUsuarioDto) {
    const atual = await this.buscar(id);
    if (email && (await this.repository.emailExiste(email, id))) throw new ConflictException('Email já cadastrado');
    if (cpf && (await this.repository.cpfExiste(cpf, id))) throw new ConflictException('CPF já cadastrado');
    await this.validarFuncionario(perfil ?? atual.perfil, lojaId, cargo, atual.lojaId === null);

    const usuario = { nome, cpf };
    const login = { email, perfil, senhaHash: senha && (await hash(senha, 10)) };
    if (Object.values({ ...usuario, ...login, lojaId, cargo }).every((valor) => valor === undefined)) {
      throw new BadRequestException('Informe ao menos um campo para atualizar');
    }

    await this.repository.atualizar(id, usuario, login, { lojaId, cargo });
    return this.repository.buscarPerfil(id);
  }

  async excluir(id: string) {
    await this.buscar(id);
    if (await this.repository.temPagamentos(id)) {
      throw new ConflictException('Usuário possui pagamentos e não pode ser excluído');
    }

    await this.repository.excluir(id);
    return { mensagem: 'Usuário excluído com sucesso' };
  }

  private async validarFuncionario(perfil: Perfil, lojaId: number | undefined, cargo: string | undefined, precisaLoja: boolean) {
    if (perfil !== 'FUNCIONARIO') {
      if (lojaId !== undefined || cargo !== undefined) throw new BadRequestException('Loja e cargo são só para funcionário');
      return;
    }
    if (lojaId === undefined) {
      if (precisaLoja) throw new BadRequestException('Informe a loja do funcionário');
      return;
    }
    if (!(await this.repository.lojaExiste(lojaId))) throw new NotFoundException('Loja não encontrada');
  }
}
