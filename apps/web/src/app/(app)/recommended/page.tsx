import { TabPlaceholder } from '@/components/tab-placeholder';

/**
 * Not a tab (PRD 2.2 keeps the nav at five). Reached from the Recommended card
 * on Home. The list and detail screens are Figma 09 and issue #182.
 */
export default function RecommendedPage() {
  return (
    <TabPlaceholder
      title="Recommended for You"
      note="Not built yet. This is the product list and detail flow from issue #182. Whether it ships in the MVP is still open — Product said the shopping surface was removed on 2 Sep, and the current PRD has it back as three user stories."
    />
  );
}
