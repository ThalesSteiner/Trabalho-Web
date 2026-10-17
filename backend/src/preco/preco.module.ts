import { Module } from '@nestjs/common';
import { PrecoController } from './preco.controller';
import { PrecoRepository } from './preco.repository';
import { PrecoService } from './preco.service';

@Module({
  controllers: [PrecoController],
  providers: [PrecoService, PrecoRepository]
})
export class PrecoModule {}
