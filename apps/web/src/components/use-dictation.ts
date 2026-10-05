'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionResultEvent = {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

export function useDictation(onText: (text: string) => void) {
  const [supported] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    const speechWindow = window as SpeechRecognitionWindow;

    return Boolean(
      speechWindow.SpeechRecognition ||
        speechWindow.webkitSpeechRecognition,
    );
  });
  const [listening, setListening] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const activeRef = useRef(false);
  const onTextRef = useRef(onText);

  useEffect(() => {
    onTextRef.current = onText;
  }, [onText]);

  useEffect(() => {
    const speechWindow = window as SpeechRecognitionWindow;
    const SpeechRecognition =
      speechWindow.SpeechRecognition ||
      speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let transcript = '';

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        if (event.results[index].isFinal) {
          transcript += event.results[index][0].transcript;
        }
      }

      if (transcript.trim()) {
        onTextRef.current(transcript.trim());
      }
    };

    recognition.onerror = (event) => {
      if (
        event.error === 'not-allowed' ||
        event.error === 'service-not-allowed'
      ) {
        setBlocked(true);
        activeRef.current = false;
        setListening(false);
      }
    };

    recognition.onend = () => {
      if (activeRef.current) {
        try {
          recognition.start();
          return;
        } catch {
          // Ignore restart errors.
        }
      }

      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      activeRef.current = false;
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  const start = useCallback(() => {
    const recognition = recognitionRef.current;

    if (!recognition || activeRef.current) {
      return;
    }

    setBlocked(false);
    activeRef.current = true;
    setListening(true);

    try {
      recognition.start();
    } catch {
      activeRef.current = false;
      setListening(false);
    }
  }, []);

  const stop = useCallback(() => {
    const recognition = recognitionRef.current;

    activeRef.current = false;
    setListening(false);

    if (recognition) {
      try {
        recognition.stop();
      } catch {
        // Ignore if already stopped.
      }
    }
  }, []);

  const toggle = useCallback(() => {
    if (activeRef.current) {
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  return {
    supported,
    listening,
    blocked,
    start,
    stop,
    toggle,
  };
}
