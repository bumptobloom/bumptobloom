'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

/**
 * Voice to text for the Ask input (Figma 05a, PM defect list item 5).
 * Dictation only: it fills the text box and never sends.
 *
 * Restored from 56b9ba0, where it was written for the frame-05 chat and later
 * dropped as part of a duplicate component (#229), not for a defect. Changes
 * since: `blocked` tells the parent when microphone permission was denied,
 * instead of the button silently doing nothing.
 *
 * Built on the browser's own SpeechRecognition: no key, no new dependency,
 * and no audio passes through our stack. Support is uneven (Chrome and Safari
 * yes, Firefox no), so `supported` is false there and the button is not shown.
 *
 * Privacy, for product: in Chrome this API sends audio to Google for
 * transcription. That is the browser's behaviour, not ours, but on a product
 * where a parent may describe her baby out loud it is worth a decision.
 */
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

// Errors that mean "permission denied", as opposed to "heard nothing".
const BLOCKED_ERRORS = new Set(['not-allowed', 'service-not-allowed']);

// Whether the browser has the API at all. Read through useSyncExternalStore:
// it never changes after load, and the server snapshot is false so SSR and
// the first client render agree.
const subscribeNever = () => () => {};

function readSupport() {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
  return Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition);
}

export function useDictation(onText: (text: string) => void) {
  const supported = useSyncExternalStore(subscribeNever, readSupport, () => false);
  const [listening, setListening] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onTextRef = useRef(onText);

  useEffect(() => {
    onTextRef.current = onText;
  }, [onText]);

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      let text = '';
      for (let i = 0; i < event.results.length; i += 1) {
        text += event.results[i][0]?.transcript ?? '';
      }
      if (text.trim()) onTextRef.current(text.trim());
    };
    recognition.onerror = (event) => {
      setListening(false);
      if (event.error && BLOCKED_ERRORS.has(event.error)) setBlocked(true);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {
        // Already stopped.
      }
    };
  }, []);

  const toggle = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (listening) {
      recognition.stop();
      setListening(false);
      return;
    }

    try {
      recognition.start();
      setBlocked(false);
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [listening]);

  return { supported, listening, blocked, toggle };
}
