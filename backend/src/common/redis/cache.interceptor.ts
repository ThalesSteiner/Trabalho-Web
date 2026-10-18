import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { trace } from '@opentelemetry/api';
import type { Request, Response } from 'express';
import type { Keyv } from 'keyv';
import { mergeMap, Observable, of } from 'rxjs';
import type { UsuarioToken } from '../../auth/auth.decorators';
export const CACHE = 'CACHE';

const semCache = ['/test'];
const limiteMs = 200;
const tracer = trace.getTracer('cache');

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE) private readonly cache: Keyv) {}

  async intercept(ctx: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const req = ctx.switchToHttp().getRequest<Request & { usuario?: UsuarioToken }>();
    const res = ctx.switchToHttp().getResponse<Response>();

    if (req.method !== 'GET') {
      return next.handle().pipe(mergeMap(async (dados) => {
        await this.medir('cache.limpar', () => this.cache.clear());
        return dados;
      }));
    }
    if (semCache.some((rota) => req.path.startsWith(rota))) return next.handle();

    const chave = `${req.usuario?.sub ?? 'publico'}:${req.originalUrl}`;
    const salvo = await this.medir('cache.ler', () => this.cache.get(chave));
    const achou = salvo !== undefined && salvo !== null;
    res.setHeader('x-cache', achou ? 'HIT' : 'MISS');
    trace.getActiveSpan()?.setAttribute('cache.hit', achou);
    if (achou) return of(salvo);

    return next.handle().pipe(mergeMap(async (dados) => {
      if (dados !== undefined) await this.medir('cache.gravar', () => this.cache.set(chave, dados));
      return dados;
    }));
  }

  private medir<T>(nome: string, operacao: () => Promise<T>) {
    return tracer.startActiveSpan(nome, async (span) => {
      try {
        const limite = new Promise<never>((_, falhar) => setTimeout(() => falhar(new Error('timeout')), limiteMs).unref());
        return await Promise.race([operacao(), limite]);
      } catch {
        span.setAttribute('cache.erro', true);
        return undefined;
      } finally {
        span.end();
      }
    });
  }
}
