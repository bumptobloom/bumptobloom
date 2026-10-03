'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

/**
 * Voice to text for the Ask input, per Figma frame 05 and confirmed with
 * product on 22 Sep: dictation only. It fills the text box and nothing else
 * -- it never sends, and there is no audio anywhere in our stack.
 *
 * Built on the browser's own SpeechRecognition. No key, no upload by us, no
 * new dependency. Support is uneven (Chrome and Safari yes, Firefox no), so
 * `supported` is false rather than throwing and the button is simply not
 * rendered where it would not work.
 *
 * Worth knowing and worth telling parents: in Chrome this API sends audio to
 * Google for transcription. That is the browser's behaviour, not ours, but
 * on a product where a mother may be describing her baby out loud it is a
 * privacy question for product and legal, not a technical detail.
 */
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

// Whether the browser has the API at all. Read through useSyncExternalStore
// rather than set from an effect: it never changes after load, the server
// snapshot is false so SSR and the first client render agree, and it keeps a
// setState out of the effect body.
const subscribeNever = () => () => {};

function readSupport() {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
  return Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition);
}

export function useDictation(onText: (text: string) => void) {
  const supported = useSyncExternalStore(subscribeNever, readSupport, () => false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onTextRef = useRef(onText);

  // Kept current in an effect, not during render: writing a ref while
  // rendering is what react-hooks/purity exists to catch.
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
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {
        // Already stopped. Nothing to do.
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
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [listening]);

  return { supported, listening, toggle };
}
