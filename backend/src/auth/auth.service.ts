import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcryptjs';
import { Repository } from 'typeorm';
import { Login } from '../usuario/login.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Login) private readonly logins: Repository<Login>,
    private readonly jwt: JwtService,
  ) {}

  async login({ email, senha }: LoginDto) {
    const login = await this.logins.findOneBy({ email });
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
