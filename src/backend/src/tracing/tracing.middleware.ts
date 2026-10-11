import { Injectable, NestMiddleware } from '@nestjs/common';
import { context, propagation, SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';
import {
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_HTTP_ROUTE,
  ATTR_URL_PATH,
} from '@opentelemetry/semantic-conventions';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class TracingMiddleware implements NestMiddleware {
  private readonly tracer = trace.getTracer('http');

  use(req: Request, res: Response, next: NextFunction) {
    const path = req.originalUrl.split('?')[0];
    const parent = propagation.extract(context.active(), req.headers);
    const span = this.tracer.startSpan(
      `${req.method} ${path}`,
      {
        kind: SpanKind.SERVER,
        attributes: {
          [ATTR_HTTP_REQUEST_METHOD]: req.method,
          [ATTR_URL_PATH]: path,
        },
      },
      parent,
    );

    res.setHeader('x-trace-id', span.spanContext().traceId);

    res.on('finish', () => {
      const route = req.route?.path ? `${req.baseUrl}${req.route.path}` : path;
      span.updateName(`${req.method} ${route}`);
      span.setAttribute(ATTR_HTTP_ROUTE, route);
      span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, res.statusCode);
      if (res.statusCode >= 500) {
        span.setStatus({ code: SpanStatusCode.ERROR });
      }
      span.end();
    });

    context.with(trace.setSpan(parent, span), next);
  }
}
