import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { trace } from '@opentelemetry/api';
import type { Knex } from 'knex';
import { KNEX } from '../common/database/knex.module';
import { Trace } from '../common/tracing/trace.decorator';
import { CreateTestDto } from './dto/create-test.dto';
import { ListTestDto } from './dto/list-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { TestEntity, TestStatus } from './test.entity';

@Injectable()
export class TestService {
  private readonly items: TestEntity[] = [];
  private nextId = 1;

  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  @Trace()
  async database() {
    const { rows } = await this.knex.raw(
      'select version() as versao, current_database() as banco, now() as horario',
    );
    return { conectado: true, ...rows[0] };
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
