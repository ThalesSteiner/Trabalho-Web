import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { Perfis } from '../auth/auth.decorators';
import { AtualizarPromocaoDto } from './dto/atualizar-promocao.dto';
import { CriarPromocaoDto } from './dto/criar-promocao.dto';
import { ListarPromocoesDto } from './dto/listar-promocoes.dto';
import { PromocaoService } from './promocao.service';

@Perfis('ADMIN')
@Controller('promocoes')
export class PromocaoController {
  constructor(private readonly service: PromocaoService) {}

  @Get('tipos')
  tipos() {
    return this.service.tipos();
  }

  @Post()
  criar(@Body() dto: CriarPromocaoDto) {
    return this.service.criar(dto);
  }

  @Get()
  listar(@Query() filtros: ListarPromocoesDto) {
    return this.service.listar(filtros);
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.service.buscarPorId(id);
  }

  @Patch(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: AtualizarPromocaoDto) {
    return this.service.atualizar(id, dto);
  }

  @Delete(':id')
  excluir(@Param('id', ParseIntPipe) id: number) {
    return this.service.excluir(id);
  }
}
