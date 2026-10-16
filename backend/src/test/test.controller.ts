import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { Span } from '@opentelemetry/api';
import { CurrentSpan } from '../tracing/current-span.decorator';
import { CreateTestDto } from './dto/create-test.dto';
import { ListTestDto } from './dto/list-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { TestService } from './test.service';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get()
  findAll(@Query() query: ListTestDto, @CurrentSpan() span: Span) {
    span.setAttributes({ 'test.page': query.page, 'test.limit': query.limit });
    return this.testService.findAll(query);
  }

  @Get('database')
  database() {
    return this.testService.database();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentSpan() span: Span) {
    span.setAttribute('test.id', id);
    return this.testService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTestDto) {
    return this.testService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTestDto, @CurrentSpan() span: Span) {
    span.setAttribute('test.id', id);
    return this.testService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentSpan() span: Span) {
    span.setAttribute('test.id', id);
    this.testService.remove(id);
  }

}
