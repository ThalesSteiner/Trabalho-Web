import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CustoModule } from './custo/custo.module';
import{DashboardModule} from './dashboard/dashboard.module';
import { CategoriaCustoModule } from './categoria-custo/categoria-custo.module';
import { databaseConfig } from './database/database.config';
import { KnexModule } from './database/knex.module';
import { PagamentoModule } from './pagamento/pagamento.module';
import { TestModule } from './test/test.module';
import { TracingMiddleware } from './tracing/tracing.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ...databaseConfig(config.getOrThrow<string>('DATABASE_URL')),
        autoLoadEntities: true,
        migrationsRun: true,
      }),
    }),
    KnexModule,
    AuthModule,
    PagamentoModule,
    CustoModule,
    DashboardModule,
    CategoriaCustoModule,
    TestModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TracingMiddleware).forRoutes('*');
  }
}
