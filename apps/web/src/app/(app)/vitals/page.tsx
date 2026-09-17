import { TabPlaceholder } from '@/components/tab-placeholder';

export default function VitalsPage() {
  return (
    <TabPlaceholder
      title="Vitals"
      note="Not built yet. Vitals is a temperature log: a reading, how it was taken, and an optional note. Readings in the fever range get a neutral label and nothing more — it does not tell you how serious anything is, and it never suggests a dose."
    />
  );
}
