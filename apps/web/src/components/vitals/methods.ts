import type { TemperatureMethod } from '@/lib/api/types';

export const DEFAULT_METHOD: TemperatureMethod = 'tympanic';

export const METHOD_OPTIONS: readonly {
  value: TemperatureMethod;
  label: string;
}[] = [
  { value: 'tympanic', label: 'Ear' },
  { value: 'axillary', label: 'Armpit' },
  { value: 'temporal', label: 'Forehead' },
  { value: 'rectal', label: 'Rectal' },
];

export const METHOD_LABELS: Record<TemperatureMethod, string> = {
  tympanic: 'Ear',
  axillary: 'Armpit',
  temporal: 'Forehead',
  rectal: 'Rectal',
};