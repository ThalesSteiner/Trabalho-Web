import { PartialType } from '@nestjs/mapped-types';
import { plainToInstance, Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString, Matches, validate } from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value; //será beeem usado
const trimCada = ({ value }: { value: unknown }) =>
  Array.isArray(value)
    ? value.map((v) => (typeof v === 'string' ? v.trim() : v))//trim em vários valores mapeados
    : value;

export class CriarFornecedorDto {
  @IsString()
  @Matches(/^\d{14}$/, { message: 'CNPJ inválido, verifique se tem 14 números' })
  cnpj: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'A razão social é obrigatória e não pode estar vazia' })
  razaoSocial: string;

  @Transform(trimCada)
  @IsArray()
  @ArrayNotEmpty({ message: 'Informe ao menos uma categoria' })
  @IsString({ each: true })
  @IsNotEmpty({ each: true, message: 'Categoria não descrita adequadamente' })
  categorias: string[];
}

export class AtualizarFornecedorDto extends CriarFornecedorDto {}

export class AtualizarParcialFornecedorDto extends PartialType(CriarFornecedorDto) {}

export class BuscarCategoriasExistentesDto {
  @Transform(trimCada)
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  categorias: string[];
}

export async function validarDto<T extends object>(classe: new () => T, dados: unknown): Promise<T>{
  if (dados === null || typeof dados !== 'object' || Array.isArray(dados)) {
    throw {status: 500, message: 'Os dados devem estar em um json válido'}
  }

  const instancia = plainToInstance(classe, dados);
  const erros = await validate(instancia, {
    whitelist: true,
    forbidNonWhitelisted: true
  });

  if (erros.length > 0) {
    const mensagens = erros.flatMap((e) => Object.values(e.constraints ?? {}));
    throw {status: 400, message: mensagens}
  }

  return instancia;
}
