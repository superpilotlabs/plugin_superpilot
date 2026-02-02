'use strict';

const Site = require('dw/system/Site');

// For boolean with default true, check explicitly for false
const enabledPref = Site.getCurrent().getCustomPreferenceValue('superpilotEnabled');
const isEnabled = enabledPref !== false;

module.exports = {
  // Kill switch - set to false to disable all Superpilot functionality
  ENABLED: isEnabled,
  PATH_PREFIX: Site.getCurrent().getCustomPreferenceValue('superpilotPathPrefix') || '/landing',
  // Sitemap suffix - results in /sitemap-{suffix}.xml (default: pages -> /sitemap-pages.xml)
  SITEMAP_SUFFIX: Site.getCurrent().getCustomPreferenceValue('superpilotSitemapSuffix') || 'pages',
  // Cache time in seconds for successful responses. Set to null to disable caching.
  CACHE_TIME: Site.getCurrent().getCustomPreferenceValue('superpilotCacheTime') || null,
};
