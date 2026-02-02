# Plugin Superpilot

This cartridge integrates Superpilot Pages (superpilot.com) with Salesforce B2C Commerce.

## Installation

1. Upload the cartridge to the active code version of your Salesforce B2C Commerce instance.
2. Optionally, import the site preferences metadata (see [Importing Metadata](#importing-metadata) below).
3. In Business Manager, go to **Administration > Operations > Services** and create a service named `Superpilot` with the type `GENERIC`.
4. Create a new credential associated with the service whose URL is your Superpilot origin eg. `https://$ORG-$ENV.pages.superpilot.ai`.
5. Add `plugin_superpilot` to your site's cartridge path.

You should now be able to access Superpilot pages at `https://$INSTANCE/s/$SITE/landing/$PATH` and the Superpilot sitemap at `https://$INSTANCE/s/$SITE/sitemap-pages.xml`.

For help and support please contact us at support@superpilot.com.

The latest version of this cartridge is available on GitHub:

- https://github.com/superpilotlabs/plugin_superpilot

## Site Preferences

Configure Superpilot behavior in Business Manager under **Merchant Tools > Site Preferences > Custom Preferences > Superpilot**.

| Preference | Type | Default | Description |
|------------|------|---------|-------------|
| `superpilotEnabled` | Boolean | `true` | Disable Superpilot |
| `superpilotPathPrefix` | String | `/landing` | URL path prefix for Superpilot pages. Supports regex with `regex:` prefix |
| `superpilotSitemapSuffix` | String | `pages` | Sitemap URL suffix (e.g., `pages` → `/sitemap-pages.xml`) |
| `superpilotCacheTime` | Integer | (none) | Cache duration in seconds for successful responses |
| `superpilotEnableSystemInfo` | Boolean | (see below) | Enable the `Superpilot-Show` diagnostic endpoint |

### Path Prefix

The path prefix determines which URLs are handled by Superpilot. By default, any path starting with `/landing` is proxied to Superpilot.

For more complex matching, use a regex pattern with the `regex:` prefix:

```
regex:^\/(landing|promo)\/
```

## Importing Metadata

The cartridge includes metadata definitions in `cartridges/plugin_superpilot/cartridge/meta/`:

- `system-objecttype-extensions.xml` - Site preference definitions
- `services.xml` - Superpilot service, profile, and credential

### Using the B2C CLI

```sh
# Upload and import in one step (default merge mode won't overwrite existing values)
b2c job import cartridges/plugin_superpilot/cartridge/meta
```

### Using Business Manager

1. Upload the `meta` folder to `/impex/src/instance/` via WebDAV
2. Go to **Administration > Site Development > Site Import & Export**
3. Select the uploaded folder and click **Import**

### Post-Import Configuration

After importing, update the service credential URL in Business Manager:

1. Go to **Administration > Operations > Services**
2. Click on **Credentials** tab, then **Superpilot**
3. Update the URL to your Superpilot origin (e.g., `https://$ORG-$ENV.pages.superpilot.ai`)

## Running Tests

The cartridge includes end-to-end tests using Vitest.

```sh
# Install dependencies
npm install

# Run tests against default instance
npm test

# Run against a specific instance
B2C_HOSTNAME=your-instance.dx.commercecloud.salesforce.com npm test

# Run with a specific test page path
TEST_PAGE_PATH=/landing/your-page npm test
```

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

## Troubleshooting

### Pages Not Loading

- This cartridge uses `server.prepend` to extend `RedirectURL-Start` and `SiteMap-Google`. If you have conflicts, review your cartridge path order and any other cartridges modifying these controllers.
- Check the URL in your Superpilot service credential. It should be `https://$ORG-$ENV.pages.superpilot.ai`.
- Verify `superpilotEnabled` is not set to `false`.
- Check that your path matches `superpilotPathPrefix`. If using regex, ensure it has the `regex:` prefix.

### Debugging Requests

Successful responses include an `X-SF-CC-Superpilot-Request-Id` header containing the request ID. Use this when contacting support.

To check your current configuration, access the `Superpilot-Show` endpoint (must be enabled on non-sandbox instances).

### Logging

This cartridge logs with the category `superpilot`. Log namespaces include:

- `superpilot.config` - Configuration loading
- `superpilot.controllers.RedirectURL` - Page request handling
- `superpilot.controllers.SiteMap` - Sitemap request handling
- `superpilot.controllers.Superpilot` - Diagnostic endpoint

To enable debug logging in Business Manager:

1. Go to **Administration > Operations > Custom Log Settings**
2. Add a Custom Log Filter with Log Category `superpilot` and Log Level `DEBUG`
3. Set Custom Log Targets to write `info` and `debug` levels to file

To tail logs via CLI:

```sh
b2c logs tail --filter custom-superpilot --last=0
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 404 on landing pages | Path doesn't match prefix | Check `superpilotPathPrefix` setting |
| 403 on Superpilot-Show | Endpoint disabled | Set `superpilotEnableSystemInfo` to `true` |
| Service error in logs | Superpilot service misconfigured | Verify service URL and credentials |
| Regex warning in logs | Regex pattern missing prefix | Add `regex:` prefix to pattern |