import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { Perfis, Publico } from '../auth/auth.decorators';
import { AtualizarNotaDto } from './dto/atualizar-nota.dto';
import { ListarNotasDto } from './dto/listar-notas.dto';
import { NotaFiscalService } from './nota-fiscal.service';

@Controller('notas-fiscais')
export class NotaFiscalController {
  constructor(private readonly notaFiscalService: NotaFiscalService) {}

  @Perfis('ADMIN', 'FUNCIONARIO')
  @Get()
  listar(@Query() filtros: ListarNotasDto) {
    return this.notaFiscalService.listar(filtros);
  }

  @Publico()
  @Get('chave/:chave')
  buscarPorChave(@Param('chave') chave: string) {
    return this.notaFiscalService.buscarPorChave(chave);
  }

  @Perfis('ADMIN', 'FUNCIONARIO')
  @Get(':uuid')
  buscar(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.notaFiscalService.buscarPorUuid(uuid);
  }

  @Perfis('ADMIN')
  @Patch(':uuid')
  atualizar(@Param('uuid', ParseUUIDPipe) uuid: string, @Body() dto: AtualizarNotaDto) {
    return this.notaFiscalService.atualizar(uuid, dto);
  }

  @Perfis('ADMIN')
  @Delete(':uuid')
  excluir(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.notaFiscalService.excluir(uuid);
  }
}
