// Only public product routes may expose their identifiers to analytics.
export function analyticsPath(path: string) {
  const pathname = path.split(/[?#]/)[0];
  if (/^\/admin(?:\/|$)/.test(pathname)) return '/admin';
  if (/^\/(skills|loops)\/[a-z0-9-]+$/.test(pathname)) return pathname;
  return ['/', '/skills', '/loops', '/about', '/sign-in', '/account', '/forgot-password', '/verify-email', '/reset-password'].includes(pathname) ? pathname : '/other';
}
export const analyticsEvents = {
  library_searched: ['kind', 'query_length', 'category_filtered', 'result_count'],
  library_category_selected: ['kind', 'category_filtered'],
  definition_copied: ['kind', 'slug', 'version'],
  auth_started: ['method', 'mode'],
  account_created: ['method', 'verification_required'],
  signed_out: [],
} as const;
export type AnalyticsEvent = keyof typeof analyticsEvents;
export function eventProperties(event: AnalyticsEvent, properties: Record<string, unknown>) {
  return Object.fromEntries(analyticsEvents[event].flatMap(key => {
    const value = properties[key];
    return (typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value)) || (typeof value === 'string' && value.length <= 100)) ? [[key, value]] : [];
  }));
}

export function scrubAnalyticsProperties(properties: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(properties).flatMap(([key, value]) => {
    if (/url|referrer|referring|pathname|search|hash|title|initial/i.test(key)) return [];
    if (value && typeof value === 'object' && !Array.isArray(value)) return [[key, scrubAnalyticsProperties(value as Record<string, unknown>)]];
    return [[key, value]];
  }));
}

