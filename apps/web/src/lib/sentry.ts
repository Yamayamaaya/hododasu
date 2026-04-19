import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || '',
  environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'local',
  release: import.meta.env.VITE_SENTRY_RELEASE || '',
  tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE) || 0,

  integrations: [Sentry.browserTracingIntegration()],

  beforeSend(event) {
    const statusCode = (event.extra?.statusCode as number) ?? 0;
    if (statusCode >= 400 && statusCode < 500) {
      event.level = 'info';
    }
    return event;
  },
});

export { Sentry };
