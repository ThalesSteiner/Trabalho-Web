import {Body, Controller, Get, HttpCode, HttpStatus, Post, Query} from '@nestjs/common';
import {Perfis, UsuarioAtual, type UsuarioToken} from '../auth/auth.decorators';
import { validarAcessoLoja } from '../auth/acesso-loja';
import { EstoqueService } from './estoque.service';
import { ListarEstoqueDto, RelatorioEstoqueDto } from './dto/filtros-estoque.dto';
import {EntradaEstoqueDto} from './dto/entrada-estoque.dto';
import { BaixaEstoqueDto } from './dto/baixa-estoque.dto';
import { DescarteVencidosDto } from './dto/descarte-vencidos.dto';

@Perfis('ADMIN', 'FUNCIONARIO')
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
  registrarEntrada(@UsuarioAtual() usuario: UsuarioToken, @Body() dto: EntradaEstoqueDto) {
    validarAcessoLoja(usuario, dto.lojaId);
    return this.service.registrarEntrada(dto);
  }

  @Post('baixa')
  @HttpCode(HttpStatus.OK)
  registrarBaixa(@UsuarioAtual() usuario: UsuarioToken, @Body() dto: BaixaEstoqueDto) {
    validarAcessoLoja(usuario, dto.lojaId);
    return this.service.registrarBaixa(dto);
  }

  @Post('descarte-vencidos')
  @HttpCode(HttpStatus.OK)
  descartarVencidos(@UsuarioAtual() usuario: UsuarioToken, @Body() dto: DescarteVencidosDto) {
    validarAcessoLoja(usuario, dto.lojaId);
    return this.service.descartarVencidos(dto);
  }
}