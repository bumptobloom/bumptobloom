import { TabPlaceholder } from '@/components/tab-placeholder';

/**
 * Not a tab (PRD 2.2 keeps the nav at five). Reached from the Recommended card
 * on Home. List and detail are Figma 09 and issue #182.
 *
 * Scope was confirmed by Vishnu on 15 Sep: product recommendations are in the
 * MVP and the dataset already exists. The earlier "removed on 2 Sep" note was
 * superseded.
 */
export default function RecommendedPage() {
  return (
    <TabPlaceholder
      title="Recommended for You"
      note="Not built yet. The product list and detail screens are issue #182, and the product dataset is ready. Confirmed in MVP scope on 15 Sep."
    />
  );
}
