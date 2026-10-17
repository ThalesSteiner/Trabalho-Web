import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { Perfis } from '../auth/auth.decorators';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import { ListarUsuariosDto } from './dto/listar-usuarios.dto';
import { UsuarioService } from './usuario.service';

@Perfis('ADMIN')
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  listar(@Query() filtros: ListarUsuariosDto) {
    return this.usuarioService.listar(filtros);
  }

  @Get(':id')
  buscar(@Param('id', ParseUUIDPipe) id: string) {
    return this.usuarioService.buscar(id);
  }

  @Patch(':id')
  atualizar(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AtualizarUsuarioDto) {
    return this.usuarioService.atualizar(id, dto);
  }

  @Delete(':id')
  excluir(@Param('id', ParseUUIDPipe) id: string) {
    return this.usuarioService.excluir(id);
  }
}
