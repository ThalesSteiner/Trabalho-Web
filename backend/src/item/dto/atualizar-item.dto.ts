import { PartialType } from '@nestjs/swagger';
import { CriarItemDto } from './criar-item.dto';

export class AtualizarItemDto extends PartialType(CriarItemDto) {}
