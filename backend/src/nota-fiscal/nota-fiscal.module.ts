import { Module } from '@nestjs/common';
import { NotaFiscalRepository } from './nota-fiscal.repository';
import { NotaFiscalService } from './nota-fiscal.service';

@Module({
  providers: [NotaFiscalService, NotaFiscalRepository],
  exports: [NotaFiscalService],
})
export class NotaFiscalModule {}
