export class RelationApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly endpoint: string,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = 'RelationApiError';
  }

  override toString(): string {
    return `${this.name}: ${this.message} (status=${this.status} endpoint=${this.endpoint})`;
  }
}

export class RelationRateLimitError extends RelationApiError {
  constructor(endpoint: string, body?: unknown) {
    super('Re:lation API rate limit exceeded (60 req/min)', 429, endpoint, body);
    this.name = 'RelationRateLimitError';
  }
}

export class RelationAuthError extends RelationApiError {
  constructor(endpoint: string, body?: unknown) {
    super('Re:lation access token missing or invalid', 401, endpoint, body);
    this.name = 'RelationAuthError';
  }
}
