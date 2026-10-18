import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { Perfis } from '../auth/auth.decorators';
import { AtualizarItemDto } from './dto/atualizar-item.dto';
import { CriarItemDto } from './dto/criar-item.dto';
import { ListarItensDto } from './dto/listar-itens.dto';
import { ItemService } from './item.service';

@Perfis('ADMIN')
@Controller('itens')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Perfis('ADMIN', 'FUNCIONARIO')
  @Get()
  listar(@Query() filtros: ListarItensDto) {
    return this.itemService.listar(filtros);
  }

  @Perfis('ADMIN', 'FUNCIONARIO')
  @Get(':id')
  buscar(@Param('id', ParseIntPipe) id: number) {
    return this.itemService.buscar(id);
  }

  @Post()
  criar(@Body() dto: CriarItemDto) {
    return this.itemService.criar(dto);
  }

  @Patch(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: AtualizarItemDto) {
    return this.itemService.atualizar(id, dto);
  }

  @Delete(':id')
  excluir(@Param('id', ParseIntPipe) id: number) {
    return this.itemService.excluir(id);
  }
}
