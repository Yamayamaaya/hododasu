import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.SENTRY_ENVIRONMENT || 'local',
  release: process.env.SENTRY_RELEASE || '',
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0,

  beforeSend(event) {
    if (event.extra) {
      delete event.extra['DATABASE_URL_POOLED'];
      delete event.extra['DATABASE_URL_DIRECT'];
    }
    return event;
  },

  sendDefaultPii: false,
});
