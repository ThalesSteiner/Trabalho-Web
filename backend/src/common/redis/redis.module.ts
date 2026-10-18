import { createKeyv } from '@keyv/redis';
import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CACHE, CacheInterceptor } from './cache.interceptor';

@Global()
@Module({
  providers: [
    {
      provide: CACHE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redis = createKeyv(
          { url: `redis://${config.get('REDIS_HOST', 'localhost')}:${config.get('REDIS_PORT', 6379)}`, disableOfflineQueue: true },
          { namespace: 'cache', throwOnConnectError: false, throwOnErrors: false },
        );
        redis.ttl = Number(config.get('CACHE_TTL', 60)) * 1000;

        // sem Redis a API continua funcionando, só sem cache
        let avisou = false;
        const avisar = () => {
          if (!avisou) new Logger('Redis').warn('Redis indisponível, seguindo sem cache');
          avisou = true;
        };
        redis.on('error', avisar);
        redis.store.on('error', avisar);
        redis.store.on('connect', () => (avisou = false));
        return redis;
      },
    },
    { provide: APP_INTERCEPTOR, useClass: CacheInterceptor },
  ],
  exports: [CACHE],
})
export class RedisModule {}
