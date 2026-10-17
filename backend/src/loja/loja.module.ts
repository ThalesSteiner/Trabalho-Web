import {Module} from '@nestjs/common';
import {LojaController} from './loja.controller';
import {LojaRepository} from './loja.repository';
import {LojaService} from './loja.service';

@Module({
  controllers: [LojaController],
  providers: [LojaService, LojaRepository]
})
export class LojaModule {}