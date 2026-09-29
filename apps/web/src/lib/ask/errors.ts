export class BabyNotFoundError extends Error {
  constructor() {
    super('Baby not found or does not belong to the authenticated parent');
    this.name = 'BabyNotFoundError';
  }
}

export class ConversationAccessError extends Error {
  constructor() {
    super('This conversation does not belong to the authenticated parent');
    this.name = 'ConversationAccessError';
  }
}

export class AskUpstreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AskUpstreamError';
  }
}

export class RateLimitedError extends Error {
  constructor() {
    // Plain on purpose: no limit and no window in the response.
    super("You've asked a lot of questions recently. Please try again later.");
    this.name = 'RateLimitedError';
  }
}
