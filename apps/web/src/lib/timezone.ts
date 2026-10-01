export function getUserTimezone(): string {
  if (typeof Intl !== 'undefined') {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  }

  return 'UTC';
}