import { Module } from '@nestjs/common';
import { CatalogoController } from './catalogo.controller';
import { CatalogoRepository } from './catalogo.repository';
import { CatalogoService } from './catalogo.service';

@Module({
  controllers: [CatalogoController],
  providers: [CatalogoService, CatalogoRepository],
})
export class CatalogoModule {}
