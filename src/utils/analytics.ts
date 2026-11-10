type AnalyticsParams = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

let analyticsInitialized = false;

export function initializeAnalytics(): void {
  const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID?.trim();
  if (!measurementId || analyticsInitialized || typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
  document.head.appendChild(script);

  window.gtag('js', new Date());
  window.gtag('config', measurementId, { send_page_view: false });
  analyticsInitialized = true;
}

export function trackAnalyticsEvent(eventName: string, params: AnalyticsParams = {}): void {
  if (typeof window !== 'undefined') {
    window.gtag?.('event', eventName, params);
  }
}

export function trackPageView(): void {
  trackAnalyticsEvent('page_view', {
    page_location: window.location.href,
    page_path: window.location.pathname,
    page_title: document.title,
  });
}
