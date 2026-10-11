import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TracingMiddleware } from './tracing/tracing.middleware';

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TracingMiddleware).forRoutes('*');
  }
}
