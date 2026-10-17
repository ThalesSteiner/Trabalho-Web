import {Body, Controller, Get, HttpCode, HttpStatus, Post, Query} from '@nestjs/common';
import {Perfis} from '../auth/auth.decorators';
import { EstoqueService } from './estoque.service';
import { ListarEstoqueDto, RelatorioEstoqueDto } from './dto/filtros-estoque.dto';
import {EntradaEstoqueDto} from './dto/entrada-estoque.dto';
import { BaixaEstoqueDto } from './dto/baixa-estoque.dto';
import { DescarteVencidosDto } from './dto/descarte-vencidos.dto';

@Perfis('ADMIN')
@Controller('estoque')
export class EstoqueController {
  constructor(private readonly service: EstoqueService) {}

  @Get()
  listar(@Query() filtros: ListarEstoqueDto) {
    return this.service.listar(filtros);
  }

  @Get('valor')
  valorPorLoja(@Query() filtros: RelatorioEstoqueDto) {
    return this.service.valorPorLoja(filtros);
  }

  @Get('cobertura')
  cobertura(@Query() filtros: RelatorioEstoqueDto) {
    return this.service.cobertura(filtros);
  }

  @Post('entrada')
  registrarEntrada(@Body() dto: EntradaEstoqueDto) {
    return this.service.registrarEntrada(dto);
  }

  @Post('baixa')
  @HttpCode(HttpStatus.OK)
  registrarBaixa(@Body() dto: BaixaEstoqueDto) {
    return this.service.registrarBaixa(dto);
  }

  @Post('descarte-vencidos')
  @HttpCode(HttpStatus.OK)
  descartarVencidos(@Body() dto: DescarteVencidosDto) {
    return this.service.descartarVencidos(dto);
  }
}