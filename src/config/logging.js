import { createLogger, format, transports } from 'winston';
import opentelemetry from '@opentelemetry/api';
// import { context, getSpan } from '@opentelemetry/api';
import traverse from 'traverse';
import cloneDeep from 'lodash.clonedeep';
import { initializeConfig } from './index';

export const obfuscateSecrets = format(info => {
  const OBFUSCATED_VALUE = '********';
  const SECRET_KEYS = ['passcode', 'data', 'authorization'];
  const updated = cloneDeep(info);
  traverse(updated).forEach(function () {
    if (SECRET_KEYS.includes(this.key)) this.update(OBFUSCATED_VALUE);
  });
  return updated;
});

export const addCommonFields = format(info => {
  const updated = cloneDeep(info);
  const tracer = opentelemetry.trace.getTracer('repo-to-gp');
  const parentSpan = tracer.startSpan('main');
  // const span = getSpan(context.active());
  // const span = tracer.getCurrentSpan(context.active());
  if (parentSpan) {
    const context = parentSpan.context();
    updated['correlationId'] = context.traceId;
    updated['spanId'] = context.spanId;
  }
  parentSpan.end();
  const { nhsEnvironment } = initializeConfig();
  updated.level = updated.level.toUpperCase();
  updated['service'] = 'repo-to-gp';
  updated['environment'] = nhsEnvironment;
  return updated;
});

export const options = {
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    obfuscateSecrets(),
    addCommonFields(),
    format.json()
  ),
  transports: [new transports.Console({ handleExceptions: true })]
};

export const logger = createLogger(options);
