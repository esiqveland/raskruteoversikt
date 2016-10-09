import Raven from 'raven-js';

export default function createRavenMiddleware(dsn) {
  /*
   Function that generates a crash reporter for Sentry.
   dsn - private Sentry DSN.
   */
  if (!Raven.isSetup()) {
    if (!dsn) {
      // Skip this middleware if there is no DSN.
      console.error('[redux-raven-middleware] Sentry DSN required.');
      return store => next => action => {
        next(action);
      };
    }
    Raven.config(dsn).install();
  }

  return store => next => action => {
    try {
      return next(action);
    } catch (err) {
      console.error('[redux-raven-middleware] Reporting error to Sentry:', err);

      // Send the report.
      Raven.captureException(err, {
        extra: {
          action: action,
          state: store.getState(),
        }
      });
    }
  }
}
