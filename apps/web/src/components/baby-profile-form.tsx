'use client';

import { FormEvent, useState } from 'react';
import { createBabyAction, updateBabyAction } from '@/app/actions/baby';
import { type BabyProfile } from '@/lib/api/baby';
import { validateBabyInput } from '@/lib/validation/baby';

interface BabyProfileFormProps {
  baby?: BabyProfile | null;
  onSaved?: (baby: BabyProfile) => void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

export default function BabyProfileForm({
  baby = null,
  onSaved,
}: BabyProfileFormProps) {
  const [name, setName] = useState(baby?.name ?? '');
  const [birthDate, setBirthDate] = useState(baby?.birthDate ?? '');
  const [dueDate, setDueDate] = useState(baby?.dueDate ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedBaby, setSavedBaby] = useState<BabyProfile | null>(baby);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    try {
      validateBabyInput({
        name,
        birthDate,
        dueDate: dueDate || null,
      });
    } catch (validationError) {
      setError(getErrorMessage(validationError));
      return;
    }

    setSaving(true);

    const input = {
      name,
      birthDate,
      dueDate: dueDate || null,
    };

    const save = savedBaby
      ? updateBabyAction(savedBaby.id, input)
      : createBabyAction(input);

    save
      .then((result) => {
        setSavedBaby(result);
        setName(result.name);
        setBirthDate(result.birthDate);
        setDueDate(result.dueDate ?? '');
        onSaved?.(result);
      })
      .catch((saveError) => {
        setError(getErrorMessage(saveError));
      })
      .finally(() => {
        setSaving(false);
      });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md space-y-6 rounded-2xl bg-white p-6 shadow-sm"
    >
      <div className="space-y-2">
        <label htmlFor="baby-name" className="block text-sm font-medium">
          Baby&apos;s name
        </label>
        <input
          id="baby-name"
          name="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="birth-date" className="block text-sm font-medium">
          Birthday
        </label>
        <input
          id="birth-date"
          name="birthDate"
          type="date"
          value={birthDate}
          onChange={(event) => setBirthDate(event.target.value)}
          required
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      {savedBaby && (
        <div className="rounded-lg bg-zinc-50 p-3">
          <p className="text-sm text-zinc-500">Age</p>
          <p className="font-medium">{savedBaby.ageLabel}</p>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="due-date" className="block text-sm font-medium">
          Due date
        </label>
        <p className="text-sm text-zinc-500">
          Optional, for babies born early.
        </p>
        <input
          id="due-date"
          name="dueDate"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-black px-4 py-2 font-medium text-white disabled:opacity-50"
      >
        {saving ? 'Saving...' : savedBaby ? 'Save changes' : 'Add baby'}
      </button>
    </form>
  );
}
