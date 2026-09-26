import { redirect } from 'next/navigation';

import { AskChat } from '@/components/ask-chat';
import { getHome } from '@/lib/api/home';

export const dynamic = 'force-dynamic';

export default async function AskPage() {
  const home = await getHome();

  if (!home.baby) {
    redirect('/onboarding');
  }

  return <AskChat babyId={home.baby.id} />;
}
