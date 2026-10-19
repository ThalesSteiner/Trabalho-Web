import { ForbiddenException } from '@nestjs/common';
import type { UsuarioToken } from './auth.decorators';

export function validarAcessoLoja(usuario: UsuarioToken, lojaId: number) {
  if (usuario.perfil === 'FUNCIONARIO' && usuario.lojaId !== lojaId) {
    throw new ForbiddenException('Funcionário só pode movimentar a própria loja');
  }
}
