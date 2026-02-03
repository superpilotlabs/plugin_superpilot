'use strict';

/**
 * Diagnostic endpoint that returns Superpilot config and system information.
 * Enabled by default on sandbox/development instances.
 * On staging/production, enable via site preference `superpilotEnableSystemInfo`.
 */

const server = require('server');
const Site = require('dw/system/Site');
const System = require('dw/system/System');
const Logger = require('dw/system/Logger');
const LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
const config = require('*/cartridge/scripts/superpilot/config');

const logger = Logger.getLogger('superpilot', 'superpilot.controllers.Superpilot');

/**
 * Check if management endpoints are enabled.
 * @returns {boolean} True if enabled.
 */
function isEndpointEnabled() {
  var enabledPref = Site.getCurrent().getCustomPreferenceValue('superpilotEnableSystemInfo');
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
  } catch {
    return null;
  }
}

server.get('Show', function (req, res, next) {
  if (!isEndpointEnabled()) {
    if (logger.isDebugEnabled()) {
      logger.debug('Show request denied - endpoint disabled');
    }
    res.setStatusCode(403);
    res.json({
      error: 'Endpoint disabled',
      message: 'Set site preference superpilotEnableSystemInfo to true',
    });
    return next();
  }

  if (logger.isDebugEnabled()) {
    logger.debug('Handling Show request');
  }

  const compatMode = System.getCompatibilityMode();
  const compatModeFormatted = Math.floor(compatMode / 100) + '.' + (compatMode % 100);

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
      compatibilityMode: compatModeFormatted,
    },
  });

  return next();
});

module.exports = server.exports();
