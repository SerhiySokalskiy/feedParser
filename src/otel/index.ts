import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node'
import {
  ConsoleMetricExporter,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics'
import {
  ConsoleLogRecordExporter,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

import { FastifyOtelInstrumentation } from '@fastify/otel'
import { FsInstrumentation } from '@opentelemetry/instrumentation-fs'
import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb'

import type { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis'
import type { RedisInstrumentation } from '@opentelemetry/instrumentation-redis'
import type { PinoInstrumentation } from '@opentelemetry/instrumentation-pino'
import { registerOtelShutdownHook } from './registerOtelShutdownHook.js'

export interface OtelOptions {
  serviceName?: string
  serviceVersion?: string
  env?: string
}

export interface OtelInitResult {
  sdk: NodeSDK
  shutdown: (reason?: string) => Promise<void>
}

export async function initOpenTelemetry(
  {
    serviceName = 'fastify-form-app',
    serviceVersion = '1.0.0',
    env = process.env.NODE_ENV || 'development',
  }: OtelOptions = {}
): Promise<OtelInitResult> {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO)

  const instrumentations: any[] = [
    new FastifyOtelInstrumentation({
      servername: serviceName,
      registerOnInitialization: true,
      ignorePaths: (opts) => opts?.url?.includes('/health'),
    }),
    new FsInstrumentation(),
    new MongoDBInstrumentation({ enhancedDatabaseReporting: true }),
  ]

  try {
    const redisMod = await import('@opentelemetry/instrumentation-redis')
    if (redisMod && (redisMod as any).RedisInstrumentation) {
      instrumentations.push(
        new (redisMod as { RedisInstrumentation: new () => RedisInstrumentation }).RedisInstrumentation()
      )
      console.log('[otel] Redis instrumentation registered')
    }
  } catch {
    try {
      const ioredisMod = await import('@opentelemetry/instrumentation-ioredis')
      if (ioredisMod && (ioredisMod as any).IORedisInstrumentation) {
        instrumentations.push(
          new (ioredisMod as { IORedisInstrumentation: new () => IORedisInstrumentation }).IORedisInstrumentation()
        )
        console.log('[otel] ioredis instrumentation registered')
      }
    } catch {
      console.log('[otel] no redis instrumentation found (skipped)')
    }
  }

  try {
    const pinoMod = await import('@opentelemetry/instrumentation-pino')
    if (pinoMod && (pinoMod as any).PinoInstrumentation) {
      instrumentations.push(
        new (pinoMod as { PinoInstrumentation: new () => PinoInstrumentation }).PinoInstrumentation()
      )
      console.log('[otel] Pino instrumentation registered')
    }
  } catch {
    console.log('[otel] pino instrumentation not installed (skipped)')
  }

  const resource = resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    [SemanticResourceAttributes.SERVICE_VERSION]: serviceVersion,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: env,
  })

  const sdk = new NodeSDK({
    resource,
    traceExporter: new ConsoleSpanExporter(),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new ConsoleMetricExporter(),
      exportIntervalMillis: 5000,
    }),
    logRecordProcessors: [
      new SimpleLogRecordProcessor(new ConsoleLogRecordExporter()),
    ],
    instrumentations,
  })

  try {
    await sdk.start()
    console.log('✅ OpenTelemetry initialized (console exporters)')
  } catch (err) {
    console.error('❌ Failed to start OpenTelemetry SDK:', err)
  }

  const shutdown = registerOtelShutdownHook(sdk)

  return { sdk, shutdown }
}
