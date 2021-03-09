import {registerInstrumentations} from "@opentelemetry/instrumentation";
import '@opentelemetry/plugin-http';
import '@opentelemetry/plugin-https';
import '@opentelemetry/plugin-express';

const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor, ConsoleSpanExporter } = require('@opentelemetry/tracing');

const tracerProvider = new NodeTracerProvider({
  plugins: {
    express: {
      enabled: true,
      path: '@opentelemetry/plugin-express',
    },
    http: {
      enabled: true,
      path: '@opentelemetry/plugin-http',
    },
    https: {
      enabled: true,
      path: '@opentelemetry/plugin-https',
    },
  },
});

tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

tracerProvider.register();
registerInstrumentations({
  tracerProvider
});

console.log('tracing initialised')

export const tracer  = tracerProvider.getTracer('repo-to-gp-tracer')