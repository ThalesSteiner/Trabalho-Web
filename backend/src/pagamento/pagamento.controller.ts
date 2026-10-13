import { Body, Controller, Get, Post } from '@nestjs/common';
import { Perfis, Publico, UsuarioAtual, type UsuarioToken } from '../auth/auth.decorators';
import { CriarPagamentoDto } from './dto/criar-pagamento.dto';
import { PagamentoService } from './pagamento.service';

@Controller('pagamentos')
export class PagamentoController {
  constructor(private readonly pagamentoService: PagamentoService) {}

  @Publico()
  @Get('formas')
  formas() {
    return this.pagamentoService.formas();
  }

  @Perfis('CLIENTE')
  @Post()
  criar(@UsuarioAtual() usuario: UsuarioToken, @Body() dto: CriarPagamentoDto) {
    return this.pagamentoService.criar(usuario.sub, dto);
  }
}
