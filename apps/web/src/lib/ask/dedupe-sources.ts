export type SourceLink = { title: string; url: string };

/**
 * Removes sources that would look identical to the parent. The chat shows
 * each source by its title (often just the site name, e.g. "cdc.gov"), so
 * two different pages from the same site read as a duplicate. Keyed on the
 * displayed title, case-insensitive, keeping the first occurrence and the
 * original order.
 */
export function dedupeSources<T extends SourceLink>(sources: readonly T[]): T[] {
  const seen = new Set<string>();

  return sources.filter((source) => {
    const key = (source.title.trim() || source.url).toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
