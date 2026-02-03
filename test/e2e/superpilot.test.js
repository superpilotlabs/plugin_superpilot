import { describe, it, expect } from 'vitest';
import { config, buildUrl } from './config.js';

const testTags = (process.env.TEST_TAGS || '').split(',').filter(Boolean);
const hasTag = (tag) => testTags.includes(tag);

describe('Superpilot Landing Pages', () => {
  it('should return 200 for a valid landing page', async () => {
    const url = buildUrl(config.pagePath);
    const response = await fetch(url);

    expect(response.status, `GET ${url}`).toBe(200);
    const body = await response.text();
    expect(body, `GET ${url}`).toContain('<');
  });

  it('should return 4xx for a non-existent landing page', async () => {
    const url = buildUrl(`nonexistent/page/404`);
    const response = await fetch(url);

    expect(response.status, `GET ${url}`).toBeGreaterThanOrEqual(400).toBeLessThan(500);
  });

  it('should include X-SF-CC-Superpilot-Request-Id header on success', async () => {
    const url = buildUrl(config.pagePath);
    const response = await fetch(url);

    expect(response.status, `GET ${url}`).toBe(200);
    const requestId = response.headers.get('X-SF-CC-Superpilot-Request-Id');
    expect(requestId, 'Expected X-SF-CC-Superpilot-Request-Id header').toBeTruthy();
  });

  it('should forward query strings to proxied pages', async () => {
    const url = buildUrl(config.pagePath + '?utm_source=test&utm_campaign=e2e');
    const response = await fetch(url);

    expect(response.status, `GET ${url}`).toBe(200);
  });

  it.runIf(hasTag('cache'))(
    '[cache] should return cached response on subsequent requests',
    async () => {
      const url = buildUrl(config.pagePath);

      const response1 = await fetch(url);
      expect(response1.status, `GET ${url}`).toBe(200);
      const requestId1 = response1.headers.get('X-SF-CC-Superpilot-Request-Id');

      // Small delay then second request
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response2 = await fetch(url);
      expect(response2.status, `GET ${url}`).toBe(200);
      const requestId2 = response2.headers.get('X-SF-CC-Superpilot-Request-Id');

      // If caching is enabled, both requests should have the same request ID
      // (the cached response contains the original request ID)
      expect(requestId1, 'Expected request ID on first request').toBeTruthy();
      expect(requestId2, 'Expected request ID on second request').toBeTruthy();
      expect(requestId2, 'Expected cached response with same request ID').toBe(requestId1);
    }
  );
});

describe('Superpilot Sitemap', () => {
  it('should return 200 for Superpilot sitemap', async () => {
    const url = buildUrl('/sitemap-pages.xml');
    const response = await fetch(url);

    expect(response.status, `GET ${url}`).toBe(200);
    const contentType = response.headers.get('content-type');
    expect(contentType).toContain('application/xml');
    const body = await response.text();
    expect(body).toContain('<urlset');
  });

  it('should return 200 for sitemap index', async () => {
    const url = buildUrl('/sitemap_index.xml');
    const response = await fetch(url);

    expect(response.status, `GET ${url}`).toBe(200);
    const body = await response.text();
    expect(body).toContain('<sitemapindex');
  });

  it('should include X-SF-CC-Superpilot-Request-Id header on sitemap', async () => {
    const url = buildUrl('/sitemap-pages.xml');
    const response = await fetch(url);

    expect(response.status, `GET ${url}`).toBe(200);
    const requestId = response.headers.get('X-SF-CC-Superpilot-Request-Id');
    expect(requestId, 'Expected X-SF-CC-Superpilot-Request-Id header').toBeTruthy();
  });
});

describe('Superpilot-Show Endpoint', () => {
  it.runIf(hasTag('info'))('[info] should return JSON response', async () => {
    const url = buildUrl('/Superpilot-Show');
    const response = await fetch(url);

    expect([200, 403]).toContain(response.status);
    const data = await response.json();
    expect(data).toBeTypeOf('object');
  });
});
