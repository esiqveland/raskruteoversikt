import * as Sentry from '@sentry/react';

export default function createRavenMiddleware(dsn: string | undefined) {
  /*
   Function that generates a crash reporter for Sentry.
   dsn - private Sentry DSN.
   */
  if (!Sentry.isInitialized()) {
    if (!dsn) {
      // Skip this middleware if there is no DSN.
      console.error('[redux-raven-middleware] Sentry DSN required.');

      return (store: any) => (next: any) => (action: any) => {
        next(action);
      };
    }
    Sentry.init({
      dsn: dsn,
    })
  }

  return (store: any) => (next: any) => (action: any) => {
    try {
      return next(action);
    } catch (err) {
      console.error('[redux-raven-middleware] Reporting error to Sentry:', err);

      // Send the report.
      Sentry.captureException(err, {
        extra: {
          action: action,
          state: store.getState(),
        }
      });
    }
  }
}
