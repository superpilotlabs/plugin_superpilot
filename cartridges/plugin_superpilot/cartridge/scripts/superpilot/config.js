'use strict';

const Site = require('dw/system/Site');
const Logger = require('dw/system/Logger');

var logger = Logger.getLogger('superpilot', 'superpilot.config');

// For boolean with default true, check explicitly for false
const enabledPref = Site.getCurrent().getCustomPreferenceValue('superpilotEnabled');
const isEnabled = enabledPref !== false;

// Path prefix - can be a string or regex (prefixed with "regex:")
const pathPrefixRaw = Site.getCurrent().getCustomPreferenceValue('superpilotPathPrefix');
const pathPrefixValue = pathPrefixRaw || '/landing';
const isPathPrefixRegex = pathPrefixValue.indexOf('regex:') === 0;
const pathPrefixPattern = isPathPrefixRegex ? pathPrefixValue.substring(6) : null;

// Warn if value looks like a regex but missing prefix
if (!isPathPrefixRegex && /[\^$*+?[\]{}|()]/.test(pathPrefixValue)) {
  logger.warn('Path prefix "{0}" contains regex characters but missing "regex:" prefix', pathPrefixValue);
}

var pathPrefixRegex = null;
if (isPathPrefixRegex) {
  try {
    pathPrefixRegex = new RegExp(pathPrefixPattern);
  } catch (e) {
    logger.error('Invalid path prefix regex: {0}, error: {1}', pathPrefixPattern, e.message);
  }
}

/**
 * Check if a path matches the configured path prefix.
 * @param {string} path - The request path to check.
 * @returns {boolean} True if the path matches.
 */
function matchesPathPrefix(path) {
  if (isPathPrefixRegex) {
    // Regex mode - if regex failed to compile, nothing matches
    return pathPrefixRegex ? pathPrefixRegex.test(path) : false;
  }
  // String prefix match
  return path.indexOf(pathPrefixValue) === 0;
}

module.exports = {
  // Kill switch - set to false to disable all Superpilot functionality
  ENABLED: isEnabled,
  // Path prefix value (for logging/debugging)
  PATH_PREFIX: pathPrefixValue,
  // Function to check if a path matches the prefix
  matchesPathPrefix: matchesPathPrefix,
  // Sitemap suffix - results in /sitemap-{suffix}.xml (default: pages -> /sitemap-pages.xml)
  SITEMAP_SUFFIX: Site.getCurrent().getCustomPreferenceValue('superpilotSitemapSuffix') || 'pages',
  // Cache time in seconds for successful responses. Set to null to disable caching.
  CACHE_TIME: Site.getCurrent().getCustomPreferenceValue('superpilotCacheTime') || null,
};
