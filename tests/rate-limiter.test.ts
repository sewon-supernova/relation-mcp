import { describe, it, expect } from 'vitest';
import { TokenBucket } from '../src/rate-limiter.js';

describe('TokenBucket', () => {
  it('allows immediate bursts up to capacity', async () => {
    const bucket = new TokenBucket(3, 1);
    const start = Date.now();
    await bucket.acquire();
    await bucket.acquire();
    await bucket.acquire();
    expect(Date.now() - start).toBeLessThan(50);
  });

  it('queues once capacity is exhausted', async () => {
    const bucket = new TokenBucket(1, 10); // 10/sec = 100ms per token
    await bucket.acquire();
    const start = Date.now();
    await bucket.acquire();
    expect(Date.now() - start).toBeGreaterThanOrEqual(80);
  });
});
