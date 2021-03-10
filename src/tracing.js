import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ExpressInstrumentation } from '@aspecto/opentelemetry-instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import '@opentelemetry/plugin-http';
import '@opentelemetry/plugin-https';
import '@opentelemetry/plugin-express';
import { propagation } from "@opentelemetry/api";
import { HttpTraceContext } from '@opentelemetry/core';

const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor, ConsoleSpanExporter } = require('@opentelemetry/tracing');

const tracerProvider = new NodeTracerProvider({
  plugins: {
    express: {
      enabled: true,
      path: '@opentelemetry/plugin-express'
    },
    http: {
      enabled: true,
      path: '@opentelemetry/plugin-http'
    },
    https: {
      enabled: true,
      path: '@opentelemetry/plugin-https'
    }
  }
});

tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
propagation.setGlobalPropagator(new HttpTraceContext());

tracerProvider.register();
registerInstrumentations({
  tracerProvider: tracerProvider,
  instrumentations: [new HttpInstrumentation()]
});

console.log('tracing initialised');

export const tracer = tracerProvider.getTracer('repo-to-gp-tracer');
