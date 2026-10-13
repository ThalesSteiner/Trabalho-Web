import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { Perfis, Publico, UsuarioAtual, type UsuarioToken } from '../auth/auth.decorators';
import { CriarPagamentoDto } from './dto/criar-pagamento.dto';
import { ListarPagamentosDto } from './dto/listar-pagamentos.dto';
import { PagamentoService } from './pagamento.service';

@Controller('pagamentos')
export class PagamentoController {
  constructor(private readonly pagamentoService: PagamentoService) {}

  @Publico()
  @Get('formas')
  formas() {
    return this.pagamentoService.formas();
  }

  @Get()
  listar(@UsuarioAtual() usuario: UsuarioToken, @Query() filtros: ListarPagamentosDto) {
    return this.pagamentoService.listar(usuario, filtros);
  }

  @Get(':id')
  buscar(@UsuarioAtual() usuario: UsuarioToken, @Param('id', ParseUUIDPipe) id: string) {
    return this.pagamentoService.buscar(usuario, id);
  }

  @Perfis('CLIENTE')
  @Post()
  criar(@UsuarioAtual() usuario: UsuarioToken, @Body() dto: CriarPagamentoDto) {
    return this.pagamentoService.criar(usuario.sub, dto);
  }

  @Perfis('ADMIN')
  @Post(':id/estornar')
  @HttpCode(200)
  estornar(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagamentoService.estornar(id);
  }
}
