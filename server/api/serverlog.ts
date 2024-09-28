import * as Sentry from "@sentry/node";
//import { nodeProfilingIntegration } from '@sentry/profiling-node';

const RAVEN_DSN = process.env.RAVEN_DSN;

Sentry.init({
  dsn: RAVEN_DSN,
  integrations: [
    // Add our Profiling integration
    //nodeProfilingIntegration(),
  ],

  // Add Tracing by setting tracesSampleRate
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // Set sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

function logRaven(msg: string, obj: any) {
  Sentry.captureException(obj, {
    data: {
      message: msg,
    }
  });
}

function log(msg: string, obj: any) {
  let args = arguments;
  if (process.env.NODE_ENV === 'production') {
    setTimeout(() => logRaven(msg, obj), 0);
  }
  console.log(args);
}

export default log;
