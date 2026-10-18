import { Controller, Get, Param, Query } from '@nestjs/common';
import { Perfis, UsuarioAtual, type UsuarioToken } from '../auth/auth.decorators';
import { IdParamDto } from '../common/dto/id-param.dto';
import { ListarVendasDto } from './dto/listar-vendas.dto';
import { VendaService } from './venda.service';

@Perfis('ADMIN', 'FUNCIONARIO')
@Controller('vendas')
export class VendaController {
  constructor(private readonly vendaService: VendaService) {}

  @Get()
  listar(@UsuarioAtual() usuario: UsuarioToken, @Query() filtros: ListarVendasDto) {
    return this.vendaService.listar(usuario, filtros);
  }

  @Get(':id')
  buscar(@UsuarioAtual() usuario: UsuarioToken, @Param() { id }: IdParamDto) {
    return this.vendaService.buscar(usuario, id);
  }
}
