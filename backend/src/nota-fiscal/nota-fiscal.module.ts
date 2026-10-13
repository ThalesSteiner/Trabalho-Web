import { Module } from '@nestjs/common';
import { NotaFiscalController } from './nota-fiscal.controller';
import { NotaFiscalRepository } from './nota-fiscal.repository';
import { NotaFiscalService } from './nota-fiscal.service';

@Module({
  controllers: [NotaFiscalController],
  providers: [NotaFiscalService, NotaFiscalRepository],
  exports: [NotaFiscalService],
})
export class NotaFiscalModule {}
