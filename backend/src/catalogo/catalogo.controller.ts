import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Publico } from '../auth/auth.decorators';
import { CatalogoService } from './catalogo.service';
import { ListarCatalogoDto } from './dto/listar-catalogo.dto';
import { ListarLojasCatalogoDto } from './dto/listar-lojas-catalogo.dto';

@Publico()
@Controller('catalogo')
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  @Get('lojas')
  lojas(@Query() filtros: ListarLojasCatalogoDto) {
    return this.catalogoService.lojas(filtros);
  }

  @Get('lojas/:id/itens')
  itens(@Param('id', ParseIntPipe) id: number, @Query() filtros: ListarCatalogoDto) {
    return this.catalogoService.itens(id, filtros);
  }
}
