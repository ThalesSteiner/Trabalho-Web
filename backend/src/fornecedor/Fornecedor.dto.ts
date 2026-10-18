import { PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString, Matches, IsInt, IsOptional, Max, Min } from 'class-validator';

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
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',').map((c) => c.trim()).filter(Boolean) : value))
  @IsArray()
  @ArrayNotEmpty({ message: 'Informe ao menos uma categoria' })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  categorias: string[];
}

export class ListarFornecedoresDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'pagina deve ser um inteiro' })
  @Min(1, { message: 'pagina deve ser no mínimo 1' })
  pagina?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limite deve ser um inteiro' })
  @Min(1, { message: 'limite deve ser no mínimo 1' })
  @Max(100, { message: 'limite deve ser no máximo 100' })
  limite?: number;

  @IsOptional()
  @Transform(trim)
  @IsString()
  razaoSocial?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  cnpj?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  categoria?: string;
}
