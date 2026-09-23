import type { TemperatureMethod } from '@/lib/api/types';

/**
 * The mother sees where she put the thermometer. The database stores the
 * clinical term from migration 0004. Order and wording are Figma frame 08,
 * which is the only frame that shows the dropdown open.
 *
 * Ear is first and is the default, as the frame shows it ticked.
 */
export const METHOD_OPTIONS: ReadonlyArray<{
  value: TemperatureMethod;
  label: string;
}> = [
  { value: 'tympanic', label: 'Ear' },
  { value: 'axillary', label: 'Armpit' },
  { value: 'temporal', label: 'Forehead' },
  { value: 'rectal', label: 'Rectal' },
];

export const DEFAULT_METHOD: TemperatureMethod = 'tympanic';

export const METHOD_LABELS: Record<TemperatureMethod, string> = {
  tympanic: 'Ear',
  axillary: 'Armpit',
  temporal: 'Forehead',
  rectal: 'Rectal',
};
