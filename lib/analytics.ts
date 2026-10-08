'use client';
import posthog from 'posthog-js';
import { analyticsPath, eventProperties, scrubAnalyticsProperties, type AnalyticsEvent } from './analytics-policy';
let ready = false;
let identity: string | null = null;
export function initializeAnalytics() {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (ready || !token || !host || typeof window === 'undefined') return;
  try {
    if (new URL(host).protocol !== 'https:') return;
    posthog.init(token, {
      api_host: host,
      defaults: '2026-05-30',
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
      disable_surveys: true,
      person_profiles: 'identified_only',
      respect_dnt: true,
      capture_exceptions: false,
      capture_performance: false,
      capture_dead_clicks: false,
      enable_heatmaps: false,
      advanced_disable_flags: true,
      save_referrer: false,
      save_campaign_params: false,
      before_send: event => {
        if (!event) return null;
        const properties = scrubAnalyticsProperties(event.properties ?? {});
        const path = analyticsPath(window.location.pathname);
        properties.$current_url = window.location.origin + path;
        properties.$pathname = path;
        event.properties = properties;
        return event;
      },
    });
    ready = true;
  } catch { /* Analytics failures must not block product use. */ }
}
export function track(event: AnalyticsEvent, properties: Record<string, unknown> = {}) {
  if (!ready) return;
  try { posthog.capture(event, eventProperties(event, properties)); } catch {}
}
export function trackPage(pathname: string) {
  if (!ready) return;
  try { posthog.capture('$pageview', { route: analyticsPath(pathname) }); } catch {}
}
export function identifyAnalytics(userId: string | null) {
  if (!ready || identity === userId) return;
  try {
    if (identity) posthog.reset();
    identity = userId;
    if (userId) posthog.identify(userId);
  } catch {}
}
export function resetAnalytics() {
  if (!ready) return;
  try { posthog.reset(); identity = null; } catch {}
}

