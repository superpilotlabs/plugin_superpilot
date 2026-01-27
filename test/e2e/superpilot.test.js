import { describe, it, expect } from 'vitest';
import { config, buildUrl } from './config.js';

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
});
