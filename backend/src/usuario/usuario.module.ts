import { Module } from '@nestjs/common';
import { UsuarioRepository } from './usuario.repository';

@Module({
  providers: [UsuarioRepository],
  exports: [UsuarioRepository],
})
export class UsuarioModule {}
