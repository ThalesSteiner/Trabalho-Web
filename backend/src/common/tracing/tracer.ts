import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';

export const tracer = new NodeSDK({
  serviceName: 'trabalho-web-api',
  traceExporter: new OTLPTraceExporter(),
  instrumentations: [new PgInstrumentation({ requireParentSpan: true })],
});

tracer.start();
