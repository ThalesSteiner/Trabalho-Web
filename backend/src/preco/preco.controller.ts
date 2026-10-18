import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Perfis } from '../auth/auth.decorators';
import { AtualizarPrecoDto } from './dto/atualizar-preco.dto';
import { CriarPrecoDto } from './dto/criar-preco.dto';
import { HistoricoPrecoDto, ListarPrecosDto, ItemIdParamDto } from './dto/listar-precos.dto';
import { PrecoService } from './preco.service';
import { IdParamDto } from '../common/dto/id-param.dto';

@Perfis('ADMIN')
@Controller('precos')
export class PrecoController {
  constructor(private readonly service: PrecoService) {}

  @Get('item/:itemId/historico')
  historico(@Param() { itemId }: ItemIdParamDto, @Query() filtros: HistoricoPrecoDto) {
    return this.service.historico(itemId, filtros);
  }

  @Post()
  criar(@Body() dto: CriarPrecoDto) {
    return this.service.criar(dto);
  }

  @Get()
  listar(@Query() filtros: ListarPrecosDto) {
    return this.service.listar(filtros);
  }

  @Get(':id')
  buscarPorId(@Param() { id }: IdParamDto) {
    return this.service.buscarPorId(id);
  }

  @Patch(':id')
  atualizar(@Param() { id }: IdParamDto, @Body() dto: AtualizarPrecoDto) {
    return this.service.atualizar(id, dto);
  }

  @Delete(':id')
  excluir(@Param() { id }: IdParamDto) {
    return this.service.excluir(id);
  }
}
