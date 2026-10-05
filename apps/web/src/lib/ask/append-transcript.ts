/**
 * Adds dictated words to whatever the parent has already typed, with one
 * space between them, and never past the input's maxLength. The input's
 * maxLength attribute only limits typing, not text set from code, so the
 * limit is applied here too.
 */
export function appendTranscript(current: string, transcript: string, maxLength: number): string {
  const addition = transcript.trim();
  if (!addition) return current;

  const base = current.trimEnd();
  const combined = base ? `${base} ${addition}` : addition;
  return combined.slice(0, maxLength);
}
