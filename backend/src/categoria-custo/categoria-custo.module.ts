import { Module } from '@nestjs/common';
import { CategoriaCustoController } from './categoria-custo.controller';
import { CategoriaCustoRepository } from './categoria-custo.repository';
import { CategoriaCustoService } from './categoria-custo.service';

@Module({
  controllers: [CategoriaCustoController],
  providers: [CategoriaCustoService, CategoriaCustoRepository]
})
export class CategoriaCustoModule {}
