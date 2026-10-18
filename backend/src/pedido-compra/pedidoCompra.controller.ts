import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { Perfis, UsuarioAtual, type UsuarioToken } from '../auth/auth.decorators';
import { PedidoCompraService } from './pedidoCompra.service';
import { AtualizarPedidoCompraDto, CriarPedidoCompraDto, ListarPedidosCompraDto } from './pedidoCompra.dto';

@Perfis('ADMIN', 'FUNCIONARIO')
@Controller('pedido-compras')
export class PedidoCompraController {
  constructor(private readonly service: PedidoCompraService) {}

  @Get()
  listar(@Query() query: ListarPedidosCompraDto) {
    return this.service.listar(query);
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.service.buscarPorId(id);
  }

  @Post()
  criar(@UsuarioAtual() usuario: UsuarioToken, @Body() dados: CriarPedidoCompraDto) {
    return this.service.criar(usuario, dados);
  }

  @Perfis('ADMIN')
  @Put(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dados: AtualizarPedidoCompraDto) {
    return this.service.atualizar(id, dados);
  }

  @Perfis('ADMIN')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.service.remover(id);
  }

  @Get(':id/promocao') //esse volta se tem uma promoção com o item de tal id
  buscarPromocao(@Param('id', ParseIntPipe) id: number) {
    return this.service.buscarPromocao(id);
  }

  @Get(':id/total') //esse volta o custo total do pedido-compra
  calcularTotal(@Param('id', ParseIntPipe) id: number) {
    return this.service.calcularTotal(id);
  }
}
