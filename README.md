# Plugin Superpilot

This cartridge integrates Superpilot Pages with Salesforce B2C Commerce.

## Installation

1. Upload the cartridge to the active code version of your Salesforce B2C Commerce instance.
2. In Business Manager, goto Admin > Operations > Services and create a service named `Superpilot` with the type `GENERIC`.
3. Create a new credential associated with the service with the URL `https://$ORG-$ENV.pages.superpilot.ai`.
4. Optionally, create a Custom Site Preference named `superpilotPathPrefix` a path prefix for the Superpilot Pages. The default prefix is `/landing`.
5. Add `plugin_superpilot` to your site's cartridge path.

You should now able to access Superpilot pages at the the URL `https://$INSTANCE/landing/$PATH` and the Superpilot sitemap at `https://$INSTANCE/sitemap-pages.xml`.

For help and support please contact us at support@superpilot.com.

The latest version of this cartridge is available on GitHub:

- https://github.com/superpilotlabs/plugin_superpilot

## Troubleshooting

- This cartridge alters the middleware chains of the controllers `RedirectURL-Start` and `SiteMap-Google` using `server.prepend`. If you are unable to load Superpilot pages or the sitemap, review how you are using these controllers in your cartridges.
- Check the URL associated with your Superpilot credential in Business Manager. It should be `https://$ORG-$ENV.pages.superpilot.ai`.

### Logging

This cartridge uses `dw/system/Logger` to log messages with the category `superpilot`.

To enable debug logging, configure Custom Log Settings in Business Manager:

1. Go to **Administration > Operations > Custom Log Settings**
2. Add a Custom Log Filter with the Log Category `superpilot` and Log Level `DEBUG`.
3. Set Custom Log Targets to write `info` and `debug` log levels to file.

To tail logs via CLI:

```sh
b2c logs tail --filter custom-superpilot --last=0
```