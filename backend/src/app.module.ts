import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CustoModule } from './custo/custo.module';
import{DashboardModule} from './dashboard/dashboard.module';
import { CategoriaCustoModule } from './categoria-custo/categoria-custo.module';
import { KnexModule } from './database/knex.module';
import { PagamentoModule } from './pagamento/pagamento.module';
import { TestModule } from './test/test.module';
import { TracingMiddleware } from './tracing/tracing.middleware';
import { PromocaoModule } from './promocao/promocao.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    KnexModule,
    AuthModule,
    PagamentoModule,
    CustoModule,
    DashboardModule,
    CategoriaCustoModule,
    TestModule,
    PromocaoModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TracingMiddleware).forRoutes('*');
  }
}
