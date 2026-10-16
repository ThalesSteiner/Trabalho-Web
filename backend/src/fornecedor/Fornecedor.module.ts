import { Module } from '@nestjs/common';
import { FornecedorController } from './Fornecedor.controller';
import { FornecedorService } from './Fornecedor.service';
import { FornecedorRepository } from './Fornecedor.repository';

@Module({
  controllers: [FornecedorController],
  providers: [FornecedorService, FornecedorRepository]
})
export class FornecedorModule {} //só para garantir que funcione
