import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { Perfis, Publico } from '../auth/auth.decorators';
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

  @Get(':uuid')
  buscar(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.notaFiscalService.buscarPorUuid(uuid);
  }
}
