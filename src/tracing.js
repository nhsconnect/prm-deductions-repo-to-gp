'use strict';
import { NodeTracerProvider } from '@opentelemetry/node';
import { SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/tracing';
import { logInfo } from './middleware/logging';

const provider = new NodeTracerProvider({});
const exporter = new ConsoleSpanExporter();
provider.register();
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
exporter.shutdown();
logInfo('tracing initialized');
