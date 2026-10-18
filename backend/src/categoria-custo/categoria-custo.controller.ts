import { Body, Controller, Delete, Get, Param, Query, Patch, Post } from '@nestjs/common';
import { Perfis } from '../auth/auth.decorators';
import { CategoriaCustoService } from './categoria-custo.service';
import { CriarCategoriaCustoDto } from './dto/criar-categoria-custo.dto';
import { AtualizarCategoriaCustoDto } from './dto/atualizar-categoria-custo.dto';
import { IdParamDto } from '../common/dto/id-param.dto';
import { ListarCategoriasCustoDto } from './dto/listar-categorias-custo.dto';

@Perfis('ADMIN')
@Controller('categorias-custo')
export class CategoriaCustoController {
  constructor(private readonly service: CategoriaCustoService) {}

  @Post()
  criar(@Body() dto: CriarCategoriaCustoDto) {
    return this.service.criar(dto);
  }

  @Get()
  listar(@Query() filtros: ListarCategoriasCustoDto) {
    return this.service.listar(filtros);
  }

  @Get(':id')
  buscarPorId(@Param() { id }: IdParamDto) {
    return this.service.buscarPorId(id);
  }

  @Patch(':id')
  atualizar(@Param() { id }: IdParamDto, @Body() dto: AtualizarCategoriaCustoDto) {
    return this.service.atualizar(id, dto);
  }

  @Delete(':id')
  excluir(@Param() { id }: IdParamDto) {
    return this.service.excluir(id);
  }
}
