import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { Perfis } from '../auth/auth.decorators';
import { CustoService } from './custo.service';
import { CriarCustoDto } from './dto/criar-custo.dto';
import { AtualizarCustoDto } from './dto/atualizar-custo.dto';
import { FiltrosCustoDto, ListarCustosDto } from './dto/filtros-custo.dto';

@Perfis('ADMIN')
@Controller('custos')
export class CustoController {
  constructor(private readonly service: CustoService) {}

  @Post()
  criar(@Body() dto: CriarCustoDto) {
    return this.service.criar(dto);
  }

  @Get()
  listar(@Query() filtros: ListarCustosDto) {
    return this.service.listar(filtros);
  }

  // Rotas fixas antes dos :ids pro resumo n ser interpretado como id
  @Get('resumo')
  resumo(@Query() filtros: FiltrosCustoDto) {
    return this.service.resumo(filtros);
  }

  @Get('resumo-por-categoria')
  resumoPorCategoria(@Query() filtros: FiltrosCustoDto) {
    return this.service.resumoPorCategoria(filtros);
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.service.buscarPorId(id);
  }

  @Patch(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: AtualizarCustoDto) {
    return this.service.atualizar(id, dto);
  }

  @Delete(':id')
  excluir(@Param('id', ParseIntPipe) id: number) {
    return this.service.excluir(id);
  }
}
