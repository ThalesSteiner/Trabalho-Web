import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { UsuarioRepository } from '../usuario/usuario.repository';
import { Login } from '../usuario/usuario.types';
import { LoginDto } from './dto/login.dto';

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

  private async gerarToken(login: Login) {
    const token = await this.jwt.signAsync({ sub: login.usuarioId, perfil: login.perfil });
    return { token };
  }
}
