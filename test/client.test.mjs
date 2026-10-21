import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { BrowserNativeClient, quickScrape } from '../index.js';

async function startApi() {
  const hits = [];
  const server = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    hits.push({ url: req.url, headers: req.headers, body: chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : null });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: { title: 'ok' }, metadata: { method: 'direct-fetch', contentStatus: 'usable', httpStatus: 200 } }));
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return { base: `http://127.0.0.1:${server.address().port}`, hits, close: () => new Promise(r => server.close(r)) };
}

describe('BrowserNativeClient (self-hosted API)', () => {
  let api;
  before(async () => { api = await startApi(); });
  after(async () => { await api.close(); });

  it('requires a baseUrl and no longer defaults to a hosted endpoint', () => {
    assert.throws(() => new BrowserNativeClient('key'), /baseUrl is required/);
    assert.throws(() => new BrowserNativeClient({ apiKey: 'key' }), /baseUrl is required/);
    assert.throws(() => new BrowserNativeClient(), /baseUrl is required/);
  });

  it('accepts (apiKey, options) and ({ baseUrl, apiKey }) and strips trailing slashes', () => {
    const a = new BrowserNativeClient('key', { baseUrl: 'http://x.test/' });
    assert.equal(a.baseUrl, 'http://x.test');
    assert.equal(a.apiKey, 'key');
    const b = new BrowserNativeClient({ baseUrl: 'http://y.test' });
    assert.equal(b.apiKey, null);
  });

  it('sends x-api-key only when a key is configured', async () => {
    api.hits.length = 0;
    const withKey = new BrowserNativeClient({ baseUrl: api.base, apiKey: 'k1' });
    const r = await withKey.scrape('https://example.test');
    assert.equal(r.success, true);
    assert.equal(r.data.metadata.contentStatus, 'usable');
    assert.equal(api.hits[0].headers['x-api-key'], 'k1');
    assert.equal(api.hits[0].url, '/scrapeurl');
    assert.match(api.hits[0].headers['user-agent'], /3\.0\.0/);
    const noKey = new BrowserNativeClient({ baseUrl: api.base });
    await noKey.scrape('https://example.test');
    assert.equal('x-api-key' in api.hits[1].headers, false);
  });

  it('convenience functions accept an options object in place of the key', async () => {
    api.hits.length = 0;
    const r = await quickScrape('https://example.test', { baseUrl: api.base, apiKey: 'k2' });
    assert.equal(r.success, true);
    assert.equal(api.hits[0].headers['x-api-key'], 'k2');
  });
});
