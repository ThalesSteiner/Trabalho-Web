import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Perfil } from '../usuario/login.entity';

export type UsuarioToken = { sub: string; perfil: Perfil };

export const Publico = () => SetMetadata('publico', true);

export const Perfis = (...perfis: Perfil[]) => SetMetadata('perfis', perfis);

export const UsuarioAtual = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): UsuarioToken => ctx.switchToHttp().getRequest().usuario,
);
