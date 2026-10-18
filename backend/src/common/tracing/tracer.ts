import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';

export const tracer = new NodeSDK({
  serviceName: process.env.OTEL_SERVICE_NAME ?? 'trabalho-web-api',
  traceExporter: new OTLPTraceExporter(),
  instrumentations: [new PgInstrumentation({ requireParentSpan: true })],
});

tracer.start();

process.once('SIGTERM', () => void tracer.shutdown().finally(() => process.exit(0)));
