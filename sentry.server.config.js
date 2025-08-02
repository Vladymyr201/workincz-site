import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://your-sentry-dsn@your-org.ingest.sentry.io/your-project",
  
  // Performance monitoring
  tracesSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release version
  release: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  
  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',
  
  // Before send function to filter events
  beforeSend(event, hint) {
    // Filter out certain errors
    if (event.exception) {
      const exception = event.exception.values?.[0];
      if (exception?.value?.includes('ResizeObserver loop limit exceeded')) {
        return null;
      }
    }
    return event;
  },
  
  // Integrations
  integrations: [
    Sentry.nodeTracingIntegration(),
  ],
}); 