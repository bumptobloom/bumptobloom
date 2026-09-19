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
  constructor(maxPerHour: number) {
    super(`You've reached the limit of ${maxPerHour} questions per hour. Please try again later.`);
    this.name = 'RateLimitedError';
  }
}
