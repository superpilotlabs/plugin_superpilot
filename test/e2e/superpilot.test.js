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
  it('should return 200 for sitemap', async () => {
    const url = buildUrl('/sitemap-pages.xml');
    const response = await fetch(url);

    expect(response.status, `GET ${url}`).toBe(200);
  });

  it('should return application/xml content-type', async () => {
    const url = buildUrl('/sitemap-pages.xml');
    const response = await fetch(url);

    const contentType = response.headers.get('content-type');
    expect(contentType, `GET ${url}`).toContain('application/xml');
  });

  it('should contain valid sitemap structure', async () => {
    const url = buildUrl('/sitemap-pages.xml');
    const response = await fetch(url);
    const body = await response.text();

    const hasUrlset = body.includes('<urlset');
    const hasSitemapIndex = body.includes('<sitemapindex');
    expect(hasUrlset || hasSitemapIndex, `GET ${url}`).toBe(true);
  });
});
