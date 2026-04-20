import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RelationClient } from '../src/client.js';
import { replyMail, listMailAccounts } from '../src/tools/mails.js';

const config = { subdomain: 'tenant', messageBoxId: 1, accessToken: 't' };

describe('reply_mail', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('refuses to send without confirm_send', async () => {
    const client = new RelationClient(config);
    await expect(
      replyMail.handler(client, {
        message_id: 1,
        mail_account_id: 2,
        to: 'user@example.com',
        subject: 'Re: hi',
        body: 'hello',
        status_cd: 'closed',
        is_html: false,
        confirm_send: false as unknown as true,
      }),
    ).rejects.toThrow(/confirm_send must be true/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends when confirm_send is true and strips the interlock from the body', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message_id: 999, ticket_id: 26104 }), {
        status: 200,
      }),
    );
    const client = new RelationClient(config);
    await replyMail.handler(client, {
      message_id: 123,
      mail_account_id: 4,
      to: 'reia@example.com',
      subject: 'Re: 本人確認',
      body: 'こんにちは',
      status_cd: 'ongoing',
      is_html: false,
      confirm_send: true,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://tenant.relationapp.jp/api/v2/1/mails/reply');
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body as string);
    expect(body).not.toHaveProperty('confirm_send');
    expect(body).not.toHaveProperty('message_box_id');
    expect(body.message_id).toBe(123);
    expect(body.status_cd).toBe('ongoing');
  });
});

describe('list_mail_accounts', () => {
  it('GETs the mail_accounts endpoint on the configured message box', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('[]', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const client = new RelationClient(config);
    await listMailAccounts.handler(client, {});
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://tenant.relationapp.jp/api/v2/1/mail_accounts');
    expect(init.method ?? 'GET').toBe('GET');
    vi.unstubAllGlobals();
  });
});
