'use strict';

/**
 * Diagnostic endpoint that returns Superpilot config and system information.
 * Enabled by default on sandbox/development instances.
 * On staging/production, enable via site preference `superpilotEnableSystemInfo`.
 */

const server = require('server');
const Site = require('dw/system/Site');
const System = require('dw/system/System');
const LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
const config = require('*/cartridge/scripts/superpilot/config');

/**
 * Check if management endpoints are enabled.
 * @returns {boolean} True if enabled.
 */
function isEndpointEnabled() {
  var enabledPref = Site.getCurrent().getCustomPreferenceValue('superpilotDebug');
  var isDevelopment = System.getInstanceType() === System.DEVELOPMENT_SYSTEM;
  return enabledPref !== null ? enabledPref : isDevelopment;
}

/**
 * Get the Superpilot service endpoint URL from service configuration.
 * @returns {string|null} The service URL or null if not configured.
 */
function getServiceURL() {
  try {
    var service = LocalServiceRegistry.createService('Superpilot', {});
    var credential = service.getConfiguration().getCredential();
    return credential ? credential.getURL() : null;
  } catch (_err) {
    return null;
  }
}

function getCompatibilityModeFormatted() {
  const compatMode = System.getCompatibilityMode();
  return Math.floor(compatMode / 100) + '.' + (compatMode % 100);
}

server.get('Start', function (req, res, next) {
  if (!isEndpointEnabled()) {
    return next();
  }

  res.json({
    superpilot: {
      enabled: config.ENABLED,
      pathPrefix: config.PATH_PREFIX,
      sitemapSuffix: config.SITEMAP_SUFFIX,
      cacheTime: config.CACHE_TIME,
      serviceURL: getServiceURL(),
    },
    instance: {
      hostname: System.getInstanceHostname(),
      compatibilityMode: getCompatibilityModeFormatted(),
    },
  });

  return next();
});

module.exports = server.exports();
