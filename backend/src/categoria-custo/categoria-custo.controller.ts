import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { Perfis } from '../auth/auth.decorators';
import { CategoriaCustoService } from './categoria-custo.service';
import { CriarCategoriaCustoDto } from './dto/criar-categoria-custo.dto';
import { AtualizarCategoriaCustoDto } from './dto/atualizar-categoria-custo.dto';

@Perfis('ADMIN')
@Controller('categorias-custo')
export class CategoriaCustoController {
  constructor(private readonly service: CategoriaCustoService) {}

  @Post()
  criar(@Body() dto: CriarCategoriaCustoDto) {
    return this.service.criar(dto);
  }

  @Get()
  listar() {
    return this.service.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.service.buscarPorId(id);
  }

  @Patch(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: AtualizarCategoriaCustoDto) {
    return this.service.atualizar(id, dto);
  }

  @Delete(':id')
  excluir(@Param('id', ParseIntPipe) id: number) {
    return this.service.excluir(id);
  }
}
