import { Module } from '@nestjs/common';
import { PromocaoController } from './promocao.controller';
import { PromocaoRepository } from './promocao.repository';
import { PromocaoService } from './promocao.service';

@Module({
  controllers: [PromocaoController],
  providers: [PromocaoService, PromocaoRepository]
})
export class PromocaoModule {}
