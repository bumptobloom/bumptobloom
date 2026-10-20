import { NextResponse } from 'next/server';
import { TERMS_OF_USE } from '@/lib/legal';

export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json(TERMS_OF_USE, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
