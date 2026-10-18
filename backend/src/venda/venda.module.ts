import { Module } from '@nestjs/common';
import { VendaController } from './venda.controller';
import { VendaRepository } from './venda.repository';
import { VendaService } from './venda.service';

@Module({
  controllers: [VendaController],
  providers: [VendaService, VendaRepository],
})
export class VendaModule {}
