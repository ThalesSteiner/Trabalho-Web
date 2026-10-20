import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Perfis } from '../auth/auth.decorators';
import { IdParamDto } from '../common/dto/id-param.dto';
import { AtualizarPromocaoDto } from './dto/atualizar-promocao.dto';
import { CriarPromocaoDto } from './dto/criar-promocao.dto';
import { ListarPromocoesDto, ListarTiposPromocaoDto } from './dto/listar-promocoes.dto';
import { PromocaoService } from './promocao.service';

@Perfis('ADMIN')
@ApiTags('Promoções')
@Controller('promocoes')
export class PromocaoController {
  constructor(private readonly service: PromocaoService) {}

  @Get('tipos')
  @ApiOperation({ summary: 'Listar tipos de promoção por id e nome' })
  tipos(@Query() filtros: ListarTiposPromocaoDto) {
    return this.service.tipos(filtros);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar uma promoção para um item' })
  criar(@Body() dto: CriarPromocaoDto) {
    return this.service.criar(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar promoções por item e tipo' })
  listar(@Query() filtros: ListarPromocoesDto) {
    return this.service.listar(filtros);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar uma promoção pelo id' })
  buscarPorId(@Param() { id }: IdParamDto) {
    return this.service.buscarPorId(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar os dados de uma promoção' })
  atualizar(@Param() { id }: IdParamDto, @Body() dto: AtualizarPromocaoDto) {
    return this.service.atualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma promoção sem vendas vinculadas' })
  excluir(@Param() { id }: IdParamDto) {
    return this.service.excluir(id);
  }
}