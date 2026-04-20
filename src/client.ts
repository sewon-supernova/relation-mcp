import { Config, resolveBaseUrl } from './config.js';
import { RelationApiError, RelationAuthError, RelationRateLimitError } from './errors.js';
import { TokenBucket } from './rate-limiter.js';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** message_box_id override. Defaults to the one from config. */
  messageBoxId?: number;
  /** Path after `/api/v2/<messageBoxId>/`, e.g. `tickets/search`. */
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

const USER_AGENT = 'relation-mcp (+https://github.com/sewon-supernova/relation-mcp)';

export class RelationClient {
  private readonly baseUrl: string;
  private readonly bucket: TokenBucket;

  constructor(private readonly config: Config) {
    this.baseUrl = resolveBaseUrl(config);
    // 1 req/sec steady state, burst up to 5 — well under the 60/min server limit.
    this.bucket = new TokenBucket(5, 1);
  }

  async request<T = unknown>(options: RequestOptions): Promise<T> {
    const messageBoxId = options.messageBoxId ?? this.config.messageBoxId;
    const url = this.buildUrl(messageBoxId, options.path, options.query);

    await this.bucket.acquire();

    const init: RequestInit = {
      method: options.method ?? 'GET',
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        Accept: 'application/json',
        'User-Agent': USER_AGENT,
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    };

    const res = await fetch(url, init);

    if (res.status === 204 || res.headers.get('content-length') === '0') {
      return undefined as T;
    }

    const text = await res.text();
    const parsed = tryParseJson(text);

    if (res.ok) {
      return parsed as T;
    }

    const endpoint = `${init.method} ${options.path}`;
    if (res.status === 401) throw new RelationAuthError(endpoint, parsed);
    if (res.status === 429) throw new RelationRateLimitError(endpoint, parsed);
    throw new RelationApiError(
      `Re:lation API request failed: ${res.status} ${res.statusText}`,
      res.status,
      endpoint,
      parsed,
    );
  }

  private buildUrl(
    messageBoxId: number,
    path: string,
    query?: Record<string, string | number | boolean | undefined>,
  ): string {
    const url = new URL(`/api/v2/${messageBoxId}/${path.replace(/^\//, '')}`, this.baseUrl);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined) continue;
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }
}

function tryParseJson(text: string): unknown {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
