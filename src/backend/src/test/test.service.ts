import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { trace } from '@opentelemetry/api';
import { DataSource } from 'typeorm';
import { Trace } from '../tracing/trace.decorator';
import { CreateTestDto } from './dto/create-test.dto';
import { ListTestDto } from './dto/list-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { TestEntity, TestStatus } from './test.entity';

@Injectable()
export class TestService {
  private readonly items: TestEntity[] = [];
  private nextId = 1;

  constructor(private readonly dataSource: DataSource) {}

  @Trace()
  async database() {
    const [result] = await this.dataSource.query(
      'select version() as versao, current_database() as banco, now() as horario',
    );
    return { conectado: true, ...result };
  }

  @Trace()
  findAll({ page, limit, nome, status }: ListTestDto) {
    const filtered = this.items.filter(
      (item) =>
        (!nome || item.nome.toLowerCase().includes(nome.toLowerCase())) &&
        (!status || item.status === status),
    );
    const start = (page - 1) * limit;

    trace.getActiveSpan()?.setAttribute('test.total', filtered.length);

    return {
      data: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      limit,
    };
  }

  @Trace()
  findOne(id: number) {
    const item = this.items.find((item) => item.id === id);
    if (!item) {
      throw new NotFoundException(`Item ${id} não encontrado`);
    }
    return item;
  }

  @Trace()
  create(dto: CreateTestDto) {
    this.validarNomeUnico(dto.nome);

    const item: TestEntity = {
      id: this.nextId++,
      nome: dto.nome,
      status: dto.status ?? TestStatus.ATIVO,
      criadoEm: new Date(),
    };
    this.items.push(item);

    trace.getActiveSpan()?.addEvent('test.criado', { 'test.id': item.id });

    return item;
  }

  @Trace()
  update(id: number, dto: UpdateTestDto) {
    const item = this.findOne(id);
    if (dto.nome && dto.nome !== item.nome) {
      this.validarNomeUnico(dto.nome);
    }
    Object.assign(item, dto);
    return item;
  }

  @Trace()
  remove(id: number) {
    const item = this.findOne(id);
    this.items.splice(this.items.indexOf(item), 1);
  }

  @Trace()
  private validarNomeUnico(nome: string) {
    const existe = this.items.some((item) => item.nome.toLowerCase() === nome.toLowerCase());
    if (existe) {
      throw new ConflictException(`Já existe um item com o nome ${nome}`);
    }
  }
}
