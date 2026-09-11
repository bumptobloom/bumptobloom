import BabyProfileForm from '@/components/baby-profile-form';
import { getBaby } from '@/lib/api/baby';

export default async function Home() {
  const baby = await getBaby().catch(() => null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-md space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {baby ? 'Baby profile' : 'Add your baby'}
          </h1>
          <p className="text-sm text-zinc-600">
            {baby
              ? 'Update your baby’s details below.'
              : 'Tell us a little about your baby.'}
          </p>
        </div>

        <BabyProfileForm baby={baby} />
      </div>
    </main>
  );
}
