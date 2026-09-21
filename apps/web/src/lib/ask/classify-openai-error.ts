import OpenAI from 'openai';

// Deliberately no free-text field: an OpenAI error message can quote the
// parent's own question back (e.g. a moderation rejection), and that must
// never reach audit_events or the logs.
export interface AskAuditPayload {
  errorKind?: 'timeout' | 'connection' | 'api' | 'unknown';
  status?: number;
  code?: string;
}

export interface ClassifiedOpenAIError {
  eventType: 'ask_timeout' | 'ask_upstream_error';
  payload: AskAuditPayload;
  summary: string;
}

// Identifier characters only, so a sentence can never pass through as a code.
const SAFE_CODE = /^[A-Za-z0-9_]{1,64}$/;

export function classifyOpenAIError(err: unknown): ClassifiedOpenAIError {
  // Order matters: timeout extends connection error extends API error.
  if (err instanceof OpenAI.APIConnectionTimeoutError) {
    return build('ask_timeout', { errorKind: 'timeout' });
  }

  if (err instanceof OpenAI.APIConnectionError) {
    return build('ask_upstream_error', { errorKind: 'connection' });
  }

  if (err instanceof OpenAI.APIError) {
    const payload: AskAuditPayload = { errorKind: 'api' };
    if (typeof err.status === 'number') {
      payload.status = err.status;
    }
    if (typeof err.code === 'string' && SAFE_CODE.test(err.code)) {
      payload.code = err.code;
    }
    return build('ask_upstream_error', payload);
  }

  return build('ask_upstream_error', { errorKind: 'unknown' });
}

function build(
  eventType: ClassifiedOpenAIError['eventType'],
  payload: AskAuditPayload,
): ClassifiedOpenAIError {
  const parts = [payload.errorKind, payload.status && `status=${payload.status}`, payload.code && `code=${payload.code}`];
  return { eventType, payload, summary: parts.filter(Boolean).join(' ') };
}
