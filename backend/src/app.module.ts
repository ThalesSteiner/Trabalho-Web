import {MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import {ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CustoModule } from './custo/custo.module';
import{DashboardModule} from './dashboard/dashboard.module';
import { CategoriaCustoModule } from './categoria-custo/categoria-custo.module';
import { KnexModule } from './common/database/knex.module';
import { PagamentoModule } from './pagamento/pagamento.module';
import { TestModule } from './test/test.module';
import { RedisModule } from './common/redis/redis.module';
import { TracingMiddleware } from './common/tracing/tracing.middleware';
import { PromocaoModule } from './promocao/promocao.module';
import{LojaModule} from './loja/loja.module';
import{EstoqueModule} from './estoque/estoque.module';
import { PrecoModule } from './preco/preco.module';
import { ItemModule } from './item/item.module';
import { CatalogoModule } from './catalogo/catalogo.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    KnexModule,
    RedisModule,
    AuthModule,
    PagamentoModule,
    CustoModule,
    DashboardModule,
    LojaModule,
    CategoriaCustoModule,
    TestModule,
    PromocaoModule,
    EstoqueModule,
    PrecoModule,
    ItemModule,
    CatalogoModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TracingMiddleware).forRoutes('*');
  }
}
