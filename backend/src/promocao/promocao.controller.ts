import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Perfis } from '../auth/auth.decorators';
import { IdParamDto } from '../common/dto/id-param.dto';
import { AtualizarPromocaoDto } from './dto/atualizar-promocao.dto';
import { CriarPromocaoDto } from './dto/criar-promocao.dto';
import { ListarPromocoesDto, ListarTiposPromocaoDto } from './dto/listar-promocoes.dto';
import { PromocaoService } from './promocao.service';

@Perfis('ADMIN')
@Controller('promocoes')
export class PromocaoController {
  constructor(private readonly service: PromocaoService) {}

  @Get('tipos')
  tipos(@Query() filtros: ListarTiposPromocaoDto) {
    return this.service.tipos(filtros);
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
  buscarPorId(@Param() { id }: IdParamDto) {
    return this.service.buscarPorId(id);
  }

  @Patch(':id')
  atualizar(@Param() { id }: IdParamDto, @Body() dto: AtualizarPromocaoDto) {
    return this.service.atualizar(id, dto);
  }

  @Delete(':id')
  excluir(@Param() { id }: IdParamDto) {
    return this.service.excluir(id);
  }
}