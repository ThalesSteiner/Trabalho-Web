import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class IdParamDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  id: number;
}