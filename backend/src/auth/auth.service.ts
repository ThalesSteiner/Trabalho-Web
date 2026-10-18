import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { UsuarioRepository } from '../usuario/usuario.repository';
import { Login } from '../usuario/usuario.types';
import { LoginDto } from './dto/login.dto';
import { RegistrarDto } from './dto/registrar.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly jwt: JwtService,
  ) {}

  async login({ email, senha }: LoginDto) {
    const login = await this.usuarioRepository.buscarLoginPorEmail(email);
    if (!login || !(await compare(senha, login.senhaHash))) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }
    return this.gerarToken(login);
  }

  async registrar({ nome, cpf, email, senha }: RegistrarDto) {
    if (await this.usuarioRepository.emailExiste(email)) throw new ConflictException('Email já cadastrado');
    if (cpf && (await this.usuarioRepository.cpfExiste(cpf))) throw new ConflictException('CPF já cadastrado');

    const senhaHash = await hash(senha, 10);
    const login = await this.usuarioRepository.criar({ nome, cpf: cpf ?? null }, { email, senhaHash, perfil: 'CLIENTE' });
    return this.gerarToken(login);
  }

  async me(usuarioId: string) {
    const usuario = await this.usuarioRepository.buscarPerfil(usuarioId);
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    return usuario;
  }

  private async gerarToken(login: Login) {
    const lojaId = login.perfil === 'FUNCIONARIO' ? await this.usuarioRepository.lojaDoFuncionario(login.usuarioId) : undefined;
    const token = await this.jwt.signAsync({ sub: login.usuarioId, perfil: login.perfil, lojaId });
    return { token };
  }
}
