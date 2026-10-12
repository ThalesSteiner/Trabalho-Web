import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { DataSource, Repository } from 'typeorm';
import { Login } from '../usuario/login.entity';
import { Usuario } from '../usuario/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { RegistrarDto } from './dto/registrar.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Login) private readonly logins: Repository<Login>,
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    private readonly dataSource: DataSource,
    private readonly jwt: JwtService,
  ) {}

  async login({ email, senha }: LoginDto) {
    const login = await this.logins.findOneBy({ email });
    if (!login || !(await compare(senha, login.senhaHash))) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }
    return this.gerarToken(login);
  }

  async registrar({ nome, cpf, email, senha }: RegistrarDto) {
    if (await this.logins.existsBy({ email })) throw new ConflictException('Email já cadastrado');
    if (cpf && (await this.usuarios.existsBy({ cpf }))) throw new ConflictException('CPF já cadastrado');

    const senhaHash = await hash(senha, 10);
    const login = await this.dataSource.transaction(async (manager) => {
      const usuario = await manager.save(Usuario, { nome, cpf });
      return manager.save(Login, { usuarioId: usuario.id, email, senhaHash, perfil: 'CLIENTE' as const });
    });
    return this.gerarToken(login);
  }

  async me(usuarioId: string) {
    const login = await this.logins.findOneOrFail({ where: { usuarioId }, relations: { usuario: true } });
    const { id, nome, cpf, criadoEm } = login.usuario;
    return { id, nome, cpf, email: login.email, perfil: login.perfil, criadoEm };
  }

  private async gerarToken(login: Login) {
    const token = await this.jwt.signAsync({ sub: login.usuarioId, perfil: login.perfil });
    return { token };
  }
}
