import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RelationClient } from '../src/client.js';
import { RelationApiError, RelationAuthError, RelationRateLimitError } from '../src/errors.js';

const baseConfig = {
  subdomain: 'tenant',
  messageBoxId: 7,
  accessToken: 'tok-123',
};

describe('RelationClient', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends Bearer auth, JSON body, and correct URL', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: 1 }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const client = new RelationClient(baseConfig);
    const result = await client.request({
      method: 'POST',
      path: 'tickets/search',
      body: { status_cds: ['open'] },
    });

    expect(result).toEqual({ ok: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://tenant.relationapp.jp/api/v2/7/tickets/search');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer tok-123');
    expect(init.body).toBe('{"status_cds":["open"]}');
  });

  it('supports per-call messageBoxId override and query params', async () => {
    fetchMock.mockResolvedValue(new Response('[]', { status: 200 }));
    const client = new RelationClient(baseConfig);
    await client.request({ path: 'tickets/1', messageBoxId: 99, query: { include: 'mails' } });
    const [url] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://tenant.relationapp.jp/api/v2/99/tickets/1?include=mails');
  });

  it('maps 401 to RelationAuthError', async () => {
    fetchMock.mockResolvedValue(new Response('{"error":"unauthorized"}', { status: 401 }));
    const client = new RelationClient(baseConfig);
    await expect(client.request({ path: 'tickets/search', method: 'POST' })).rejects.toBeInstanceOf(
      RelationAuthError,
    );
  });

  it('maps 429 to RelationRateLimitError', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 429 }));
    const client = new RelationClient(baseConfig);
    await expect(client.request({ path: 'tickets/search', method: 'POST' })).rejects.toBeInstanceOf(
      RelationRateLimitError,
    );
  });

  it('maps other non-2xx to RelationApiError with payload', async () => {
    fetchMock.mockResolvedValue(
      new Response('{"error":"missing field"}', { status: 422, statusText: 'Unprocessable' }),
    );
    const client = new RelationClient(baseConfig);
    await expect(client.request({ path: 'tickets/1' })).rejects.toMatchObject({
      name: 'RelationApiError',
      status: 422,
    });
  });

  it('returns undefined on 204', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    const client = new RelationClient(baseConfig);
    await expect(
      client.request({ path: 'tickets/1', method: 'PUT', body: { status_cd: 'closed' } }),
    ).resolves.toBeUndefined();
  });

  it('does not throw on unrelated error types', async () => {
    fetchMock.mockResolvedValue(new Response('nope', { status: 500 }));
    const client = new RelationClient(baseConfig);
    await expect(client.request({ path: 'x' })).rejects.not.toBeInstanceOf(RelationAuthError);
  });

  it('keeps RelationApiError structure for inspection', () => {
    const e = new RelationApiError('boom', 500, 'GET x');
    expect(e.toString()).toContain('status=500');
  });
});
