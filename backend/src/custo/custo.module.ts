import { Module } from '@nestjs/common';
import { CustoController } from './custo.controller';
import { CustoRepository } from './custo.repository';
import { CustoService } from './custo.service';

@Module({
  controllers: [CustoController],
  providers: [CustoService, CustoRepository]
})
export class CustoModule {}
