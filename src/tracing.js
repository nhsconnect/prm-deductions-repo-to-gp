import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { propagation } from '@opentelemetry/api';
import { HttpTraceContext } from '@opentelemetry/core';
const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor, ConsoleSpanExporter } = require('@opentelemetry/tracing');

const tracerProvider = new NodeTracerProvider({});

tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
propagation.setGlobalPropagator(new HttpTraceContext());

tracerProvider.register();
registerInstrumentations({
  tracerProvider: tracerProvider,
  instrumentations: [new HttpInstrumentation()]
});

console.log('tracing initialised');

export const tracer = tracerProvider.getTracer('repo-to-gp-tracer');
