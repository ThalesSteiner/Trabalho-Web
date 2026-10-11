import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { TestStatus } from '../test.entity';

export class CreateTestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome: string;

  @IsOptional()
  @IsEnum(TestStatus)
  status?: TestStatus;
}
