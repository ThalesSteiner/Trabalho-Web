import { Module } from '@nestjs/common';
import { FornecedorController } from 'main/backend/src/fornecedor/Fornecedor.controller.ts';
import { FornecedorService } from 'main/backend/src/fornecedor/Fornecedor.service.ts';
import { FornecedorRepository } from 'main/backend/src/fornecedor/Fornecedor.repository.ts';

@Module({
  controllers: [FornecedorController],
  providers: [FornecedorService, FornecedorRepository]
})
export class FornecedorModule {} //só para garantir que funcione
