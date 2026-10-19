import {Body, Controller,Get, Param, Delete,ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import {Perfis} from '../auth/auth.decorators';
import {LojaService} from './loja.service';
import {CriarLojaDto} from './dto/criar-loja.dto';
import {AtualizarLojaDto} from './dto/atualizar-loja.dto';
import {ListarLojasDto} from './dto/filtros-loja.dto';

@Perfis('ADMIN')
@Controller('lojas')
export class LojaController {
  constructor(private readonly service: LojaService) {}

  @Post()
  criar(@Body() dto: CriarLojaDto) {
    return this.service.criar(dto);
  }

  @Perfis('ADMIN', 'FUNCIONARIO')
  @Get()
  listar(@Query() filtros: ListarLojasDto) {
    return this.service.listar(filtros);
  }

  @Perfis('ADMIN', 'FUNCIONARIO')
  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.service.buscarPorId(id);
  }

  @Patch(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: AtualizarLojaDto) {
    return this.service.atualizar(id, dto);
  }

  @Delete(':id')
  excluir(@Param('id', ParseIntPipe) id: number) {
    return this.service.excluir(id);
  }
}