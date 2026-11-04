# Plugin Superpilot

This cartridge integrates Superpilot pages (superpilot.com) with Salesforce B2C Commerce.

## Installation

1. Upload the cartridge to the active code version of your B2C instance.
2. [Import the Metadata](#importing-metadata).
3. In Business Manager, add `plugin_superpilot` to your site's cartridge path.

Verify you can access Superpilot pages at `https://$INSTANCE/s/$SITE/landing/$PATH` and the Superpilot sitemap at `https://$INSTANCE/s/$SITE/sitemap-pages.xml`.

For help, please contact support@superpilot.com.

The latest version of this cartridge is available on GitHub:

- https://github.com/superpilotlabs/plugin_superpilot

## Importing Metadata

The cartridge requires metadata definitions in `data`.

Import them to your instance with the [`b2c`](https://salesforcecommercecloud.github.io/b2c-developer-tooling/) CLI or Business Manager.

### Using the B2C CLI

Upload and import metadata:

```sh
b2c job import data
```

### Using Business Manager

1. Upload the `data` folder to `/impex/src/instance/` via WebDAV
2. Go to **Administration > Site Development > Site Import & Export**
3. Select the uploaded folder and click **Import**

### Configuration

After import, update the `Superpilot` service credential URL in Business Manager:

1. Go to **Administration > Operations > Services**
2. Click on **Credentials** tab, then **Superpilot**
3. Update the URL to your Superpilot environment origin (e.g., `https://$ORG-$ENV.pages.superpilot.net`)

## Site Preferences

Customize behavior in Business Manager under **Merchant Tools > Site Preferences > Custom Preferences > Superpilot**.

| Preference                | Type    | Default    | Description                                                                     |
| ------------------------- | ------- | ---------- | ------------------------------------------------------------------------------- |
| `superpilotEnabled`       | Boolean | `true`     | Disable Superpilot                                                              |
| `superpilotPathPrefix`    | String  | `/landing` | URL path prefix for Superpilot pages. Supports regex with `regex:` prefix       |
| `superpilotSiteMapSuffix` | String  | `pages`    | Sitemap URL suffix (e.g., `pages` → `/sitemap-pages.xml`)                       |
| `superpilotCacheTime`     | Integer | (none)     | Cache duration in seconds for successful responses. Unset, pages are not cached |
| `superpilotDebug`         | Boolean | (none)     | Enable the `Superpilot-Show` diagnostic endpoint                                |

### Path Prefix

The path prefix determines which URLs are handled by Superpilot.

By default, paths starting with `/landing` are handled.

For complex matching, use a regex pattern with the `regex:` prefix:

```
regex:^\/(landing|promo)\/
```

## Response Headers

Superpilot's response headers are passed on to the shopper, with two limits:

- **A blocklist** in `scripts/superpilot/proxy.js` drops headers that belong to your domain or to
  Superpilot's CDN: hop-by-hop headers, cookies, HSTS, CORS, referrer policy, error reporting, and
  caching headers (caching is `superpilotCacheTime`).
- **B2C's own list.** A script may only set the public headers named by `dw.system.Response`'s
  constants (such as `Content-Type`, `X-Robots-Tag`, `Vary`, `Link`), plus custom `X-SF-CC-`
  headers. The cartridge writes each header with B2C's spelling and skips the rest.

So a header Superpilot adds later, such as `X-Robots-Tag: noindex` on a page's Markdown copy
(`/landing/<page>.md`), reaches the shopper with no cartridge change, as long as B2C allows it.

## Troubleshooting

### Pages Not Loading

- This cartridge uses `server.prepend` to extend `RedirectURL-Start` and `SiteMap-Google`. Review cartridge path order. Review cartridges using these controllers.
- Check the URL of your Superpilot service credential. It must be set to your Superpilot origin.
- Verify `superpilotEnabled` is not set to `false`.
- Check your request path matches `superpilotPathPrefix`. If using regex, ensure it has the `regex:` prefix.

### Debugging Requests

Successful responses include an `X-SF-CC-Superpilot-Request-Id` header containing the request ID.
Use this when contacting support.

To check your current configuration, open the `Superpilot-Show` controller at
`https://$INSTANCE/on/demandware.store/Sites-$SITE-Site/default/Superpilot-Show`. It answers on
sandboxes, and elsewhere only with `superpilotDebug` set.

### Logging

This cartridge logs with the category `superpilot`.

To enable debug logging in Business Manager:

1. Go to **Administration > Operations > Custom Log Settings**
2. Add a Custom Log Filter with Log Category `superpilot` and Log Level `DEBUG`
3. Set Custom Log Targets to write `info` and `debug` levels to file

To tail logs via CLI:

```sh
b2c logs tail --filter custom-superpilot
```

### Common Errors

| Error                             | Cause                                  | Solution                                      |
| --------------------------------- | -------------------------------------- | --------------------------------------------- |
| 404 on landing pages              | Path doesn't match prefix              | Check `superpilotPathPrefix` setting          |
| Service error in logs             | Superpilot service misconfigured       | Verify service URL and credentials            |
| Regex warning in logs             | Regex pattern missing prefix           | Add `regex:` prefix to pattern                |
| `Header refused by B2C` warning   | B2C rejected a header Superpilot sent  | Harmless: the page is still served without it |
| `.md` pages served as `text/html` | Cartridge older than header forwarding | Upgrade the cartridge                         |

## Running Tests

The cartridge includes end-to-end tests using Vitest.

```sh
# Install dependencies
npm install

# Run tests against default instance
npm test

# Run against a specific storefront host
B2C_HOSTNAME=your-sandbox.my.commercecloud.salesforce.com npm test

# Run with a specific test page path
TEST_PAGE_PATH=/landing/your-page npm test
```

On-demand sandboxes now serve their storefront on `*.my.commercecloud.salesforce.com`, and the
same host takes code deploys and WebDAV; the old `*.dx.commercecloud.salesforce.com` host redirects
storefront pages. Point `B2C_HOSTNAME` (and `dw.json`) at the `my` host.

The sitemap index case needs the instance's own sitemap generated. `test/data` defines a
`CreateSitemap` job for `RefArch`; import it once, and run it again after the host or hostname
aliases change:

```sh
b2c job import test/data
b2c job run SuperpilotTestCreateSitemap -w
```

The test sandbox runs compatibility mode 19.10, the oldest B2C supports, on purpose: the
cartridge has to work on every customer's instance, so it is tested where the platform is most
restrictive. Keep it there, and keep the cartridge to what 19.10 allows. One trap found on it: a
`const` declared inside a loop body is bound once, on the first pass, so loop-scoped bindings are
`let`.

### Tagged Tests

Some tests require specific configuration and are skipped by default. Enable them with `TEST_TAGS`:

```sh
# Run cache test (requires superpilotCacheTime to be configured)
TEST_TAGS=cache npm test

# Run Superpilot-Show endpoint test
TEST_TAGS=info npm test

# Run multiple tagged tests
TEST_TAGS=cache,info npm test
```
