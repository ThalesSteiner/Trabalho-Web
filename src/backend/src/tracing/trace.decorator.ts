import { SpanStatusCode, trace } from '@opentelemetry/api';

const tracer = trace.getTracer('app');

export function Trace(name?: string): MethodDecorator {
  return (target, key, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    const spanName = name ?? `${target.constructor.name}.${String(key)}`;

    descriptor.value = function (this: unknown, ...args: unknown[]) {
      return tracer.startActiveSpan(spanName, (span) => {
        const fail = (error: Error) => {
          span.recordException(error);
          span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
          span.end();
          throw error;
        };

        try {
          const result = original.apply(this, args);
          if (result instanceof Promise) {
            return result.then((value) => {
              span.end();
              return value;
            }, fail);
          }
          span.end();
          return result;
        } catch (error) {
          return fail(error as Error);
        }
      });
    };

    for (const metadataKey of Reflect.getMetadataKeys(original)) {
      Reflect.defineMetadata(metadataKey, Reflect.getMetadata(metadataKey, original), descriptor.value);
    }
  };
}
