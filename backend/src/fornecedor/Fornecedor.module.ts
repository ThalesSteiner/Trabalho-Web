import { Module } from '@nestjs/common';
import { FornecedorController } from 'main/backend/src/fornecedor/Fornecedor.controller';
import { FornecedorService } from 'main/backend/src/fornecedor/Fornecedor.service';
import { FornecedorRepository } from 'main/backend/src/fornecedor/Fornecedor.repository';

@Module({
  controllers: [FornecedorController],
  providers: [FornecedorService, FornecedorRepository]
})
export class FornecedorModule {} //só para garantir que funcione
