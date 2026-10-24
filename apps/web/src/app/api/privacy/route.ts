import { NextResponse } from 'next/server';
import { PRIVACY_POLICY, CONSUMER_HEALTH_DATA_PRIVACY_POLICY } from '@/lib/legal';

export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json(
    {
      privacyPolicy: PRIVACY_POLICY,
      consumerHealthDataPrivacyPolicy: CONSUMER_HEALTH_DATA_PRIVACY_POLICY,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    }
  );
}
