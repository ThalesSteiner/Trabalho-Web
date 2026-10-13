import { Module } from '@nestjs/common';
import { NotaFiscalRepository } from './nota-fiscal.repository';

@Module({
  providers: [NotaFiscalRepository],
})
export class NotaFiscalModule {}
