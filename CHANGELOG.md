# Changelog

## 0.0.4

### Fixes

- **Sitemap import job**: `SuperpilotImportSiteMap` was invalid on every instance, because
  `steptypes.json` named its module `importSiteMap.js` and the file is `importSitemap.js`. Run it
  after upgrading so B2C's `sitemap_index.xml` lists `/sitemap-pages.xml`.

### Development

- `@salesforce/b2c-cli` 2.12, `actions/checkout` and `actions/setup-node` v7, `pnpm/action-setup` v6.

## 0.0.3

### Features

- **Response headers**: Superpilot's response headers now reach the shopper, where before only the
  body did. A blocklist keeps out headers your domain or Superpilot's CDN owns (cookies, HSTS, CORS,
  referrer policy, caching), and only headers B2C lets a script set get through. A page's Markdown
  copy (`/landing/<page>.md`) is now served as `text/markdown` with `X-Robots-Tag: noindex`, so
  search engines index the page, not the copy.

### Fixes

- **`Superpilot-Show`** answered 500: its route was registered as `Start`. It is `Show` again, at
  `/on/demandware.store/Sites-<site>-Site/default/Superpilot-Show`, and `Start` still answers. It
  now reports the cartridge's `version`.
- **Sitemap content type** is `application/xml` unless Superpilot sends another.
- Custom `X-SF-CC-` headers from Superpilot are passed on; a text content type without a charset
  gets `charset=utf-8`.
- A header B2C refuses is skipped and logged as `Header refused by B2C`, never failing the page.

### Development

- Node 26 and pnpm 10.32.1, as in the Superpilot repo.
- e2e runs against the sandbox's `*.my.commercecloud.salesforce.com` host, and checks the Markdown
  copy's headers and the `Superpilot-Show` response.
- `test/data/jobs.xml` defines a `CreateSitemap` job for generating a test sandbox's sitemap.

## 0.0.2 (Version 2)

### Features

- **Kill switch**: New `superpilotEnabled` site preference to disable all Superpilot functionality without removing the cartridge
- **Regex path matching**: Path prefix now supports regex patterns with `regex:` prefix (e.g., `regex:^\/(landing|promo)\/`)
- **Configurable sitemap suffix**: New `superpilotSitemapSuffix` site preference to customize the sitemap URL (default: `pages` → `/sitemap-pages.xml`)
- **Page caching**: New `superpilotCacheTime` site preference to set cache duration in seconds for successful responses
- **Query string forwarding**: Proxied requests now include the original query string
- **Request ID header**: Successful responses include `X-SF-CC-Superpilot-Request-Id` header for debugging
- **Instance identification**: Outgoing requests include `X-B2C-Instance` header with the instance hostname

### Improvements

- **Logging**: Added structured logging with `superpilot` category and controller-specific namespaces
- **Debug logging**: Request handling logged at debug level with `isDebugEnabled()` guard
- **Error logging**: Errors include full URL, status code, and CloudFront request ID
- **Service timeout**: Respects timeout from service profile configuration
- **No redirect following**: HTTP client no longer follows redirects automatically
- **Case-insensitive headers**: Response header lookups are now case-insensitive

### Superpilot-Show Endpoint

- Now displays all Superpilot configuration settings including service URL
- Enabled by default on sandbox/development instances
- Validation warning logged if path prefix looks like regex but missing `regex:` prefix

### Site Preferences

| Preference                   | Type    | Default    | Description                                |
| ---------------------------- | ------- | ---------- | ------------------------------------------ |
| `superpilotEnabled`          | Boolean | `true`     | Kill switch to disable all functionality   |
| `superpilotPathPrefix`       | String  | `/landing` | URL path prefix (supports `regex:` prefix) |
| `superpilotSitemapSuffix`    | String  | `pages`    | Sitemap URL suffix                         |
| `superpilotCacheTime`        | Integer | (none)     | Cache duration in seconds                  |
| `superpilotEnableSystemInfo` | Boolean | `false`\*  | Enable Superpilot-Show endpoint            |

\* Defaults to `true` on sandbox/development instances
