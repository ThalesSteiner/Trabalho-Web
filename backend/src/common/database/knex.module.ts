import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import knex from 'knex';
import { types } from 'pg';

export const KNEX = 'KNEX';

types.setTypeParser(types.builtins.INT8, Number);
types.setTypeParser(types.builtins.NUMERIC, Number);

const paraSnake = (nome: string) => nome.replace(/[A-Z]/g, (letra) => '_' + letra.toLowerCase());
const paraCamel = (nome: string) => nome.replace(/_(\w)/g, (_, letra: string) => letra.toUpperCase());

const camelizar = (valor: unknown): unknown => {
  if (Array.isArray(valor)) return valor.map(camelizar);
  if (valor?.constructor !== Object) return valor;
  return Object.fromEntries(Object.entries(valor as object).map(([chave, v]) => [paraCamel(chave), v]));
};

@Global()
@Module({
  providers: [
    {
      provide: KNEX,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        knex({
          client: 'pg',
          connection: config.getOrThrow<string>('DATABASE_URL'),
          wrapIdentifier: (valor, original) => original(paraSnake(valor)),
          postProcessResponse: camelizar,
        }),
    },
  ],
  exports: [KNEX],
})
export class KnexModule {}
