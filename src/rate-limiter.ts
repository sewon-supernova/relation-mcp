/**
 * Re:lation API limits each tenant to 60 requests per minute. We use a simple
 * token bucket sized one-req-per-second so we never hit 429 under normal use.
 * Callers `await acquire()` before each request.
 */
export class TokenBucket {
  private tokens: number;
  private lastRefillMs: number;

  constructor(
    private readonly capacity: number,
    private readonly refillPerSecond: number,
  ) {
    this.tokens = capacity;
    this.lastRefillMs = Date.now();
  }

  async acquire(): Promise<void> {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }
    const waitMs = Math.ceil(((1 - this.tokens) / this.refillPerSecond) * 1000);
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    return this.acquire();
  }

  private refill(): void {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefillMs) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSec * this.refillPerSecond);
    this.lastRefillMs = now;
  }
}
