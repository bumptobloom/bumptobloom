'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User } from 'lucide-react';
import { createBabyAction, updateBabyAction } from '@/app/actions/baby';
import { type BabyProfile } from '@/lib/api/baby';
import { validateBabyInput } from '@/lib/validation/baby';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';

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

/** PRD US-04: required fields carry an asterisk. */
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="mb-1.5 block text-[0.78rem] text-[var(--text-primary)]">
      {children}
      {required ? <span className="text-[var(--text-accent-terracotta)]"> *</span> : null}
    </span>
  );
}

const dateFieldClass =
  'w-full rounded-[var(--radius-input)] border border-[var(--border-subtle)] bg-[var(--surface-terra)]/40 px-4 py-3 ' +
  'text-[0.9rem] text-[var(--text-primary)] outline-none transition ' +
  'focus:border-[var(--text-brand)] focus:ring-2 focus:ring-[var(--text-brand)]/20';

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
      noValidate
      className="w-full space-y-4 rounded-3xl border border-[var(--border-card)] bg-[var(--card-primary)] px-5 py-6"
    >
      <Link
        href="/onboarding"
        className="inline-flex items-center gap-1.5 text-[0.82rem] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>

      {/*
        Figma 02 shows an uploaded photo with an edit affordance. Product asked
        for a baby emoji for the MVP rather than infant photo storage, so this
        is display only — there is no upload control until that is revisited.
      */}
      <div className="flex flex-col items-center gap-1.5 pt-1">
        <div
          aria-hidden
          className="flex size-20 items-center justify-center rounded-full bg-[var(--surface-terra)] text-[2rem]"
        >
          👶
        </div>
        <span className="text-[0.72rem] text-[var(--text-secondary)]">
          Profile Picture
        </span>
      </div>

      <h1 className="pt-1 text-center text-[1.05rem] leading-[1.4] text-[var(--text-primary)]">
        {savedBaby
          ? 'Baby profile'
          : 'What\u2019s your baby\u2019s name and date of birth?'}
      </h1>

      <label className="block">
        <FieldLabel required>Name</FieldLabel>
        <TextField
          id="baby-name"
          name="name"
          type="text"
          required
          placeholder="Enter name"
          icon={<User className="size-4" />}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <label className="block">
        <FieldLabel required>Date of Birth</FieldLabel>
        <input
          id="birth-date"
          name="birthDate"
          type="date"
          required
          value={birthDate}
          onChange={(event) => setBirthDate(event.target.value)}
          className={dateFieldClass}
        />
      </label>

      {/*
        Figma 02 and PRD US-04 collect name and date of birth only. Due date was
        ruled out of MVP scope on 2 Sep, so the input is gone — but an existing
        value stays in state and is sent back unchanged, so editing a preterm
        baby's profile does not silently erase the due date ADR-004 stores.
      */}


      {error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-input)] bg-[var(--surface-terra)] px-3 py-2.5 text-[0.8rem] text-[var(--text-accent-terracotta)]"
        >
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={saving}
        className="h-12 w-full rounded-[var(--radius-button-primary)] text-[0.95rem]"
      >
        {saving ? 'Saving…' : savedBaby ? 'Save changes' : 'Continue'}
      </Button>

      <p className="text-center text-[0.75rem] text-[var(--text-secondary)]">
        You can update this anytime in your profile settings.
      </p>
    </form>
  );
}
