import { describe, it, expect } from 'vitest';
import { loadConfig, resolveBaseUrl } from '../src/config.js';

describe('loadConfig', () => {
  it('parses a valid environment', () => {
    const config = loadConfig({
      RELATION_SUBDOMAIN: 'mytenant',
      RELATION_MESSAGE_BOX_ID: '42',
      RELATION_ACCESS_TOKEN: 'token-abc',
    } as NodeJS.ProcessEnv);
    expect(config).toEqual({
      subdomain: 'mytenant',
      messageBoxId: 42,
      accessToken: 'token-abc',
      baseUrl: undefined,
    });
  });

  it('throws a grouped error when config is missing', () => {
    expect(() =>
      loadConfig({
        RELATION_SUBDOMAIN: '',
        RELATION_MESSAGE_BOX_ID: 'not-a-number',
        RELATION_ACCESS_TOKEN: '',
      } as NodeJS.ProcessEnv),
    ).toThrow(/invalid configuration/);
  });

  it('rejects subdomains with invalid characters', () => {
    expect(() =>
      loadConfig({
        RELATION_SUBDOMAIN: 'my tenant!',
        RELATION_MESSAGE_BOX_ID: '1',
        RELATION_ACCESS_TOKEN: 'tok',
      } as NodeJS.ProcessEnv),
    ).toThrow();
  });
});

describe('resolveBaseUrl', () => {
  it('derives the URL from subdomain by default', () => {
    expect(
      resolveBaseUrl({
        subdomain: 'demo',
        messageBoxId: 1,
        accessToken: 'x',
      }),
    ).toBe('https://demo.relationapp.jp');
  });

  it('respects an explicit baseUrl', () => {
    expect(
      resolveBaseUrl({
        subdomain: 'demo',
        messageBoxId: 1,
        accessToken: 'x',
        baseUrl: 'https://example.test',
      }),
    ).toBe('https://example.test');
  });
});
