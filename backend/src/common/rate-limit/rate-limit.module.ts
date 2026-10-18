import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Throttle, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

const minuto = 60_000;

export const LimiteLogin = () =>
  Throttle({ default: { ttl: minuto, limit: () => Number(process.env.RATE_LIMIT_LOGIN ?? 5) } });

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [{ name: 'default', ttl: minuto, limit: Number(config.get('RATE_LIMIT', 100)) }],
        errorMessage: 'Muitas requisições, tente novamente em instantes',
      }),
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class RateLimitModule {}
