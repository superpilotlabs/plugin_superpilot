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

/**
 * Get the Superpilot service endpoint URL from service configuration.
 * @returns {string|null} The service URL or null if not configured.
 */
function getServiceURL() {
  try {
    var service = LocalServiceRegistry.createService('Superpilot', {});
    var credential = service.getConfiguration().getCredential();
    return credential ? credential.getURL() : null;
  } catch (e) {
    return null;
  }
}

const logger = Logger.getLogger('superpilot', 'superpilot.controllers.Superpilot');

server.get('Show', function (req, res, next) {
  var enabledPref = Site.getCurrent().getCustomPreferenceValue('superpilotEnableSystemInfo');
  // Default to enabled on sandbox/development instances if not explicitly set
  var isDevelopment = System.getInstanceType() === System.DEVELOPMENT_SYSTEM;
  var isEnabled = enabledPref !== null ? enabledPref : isDevelopment;

  if (!isEnabled) {
    if (logger.isDebugEnabled()) {
      logger.debug('SystemInfo request denied - endpoint disabled');
    }
    res.setStatusCode(403);
    res.json({
      error: 'Endpoint disabled',
      message: 'Set site preference superpilotEnableSystemInfo to true',
    });
    return next();
  }

  if (logger.isDebugEnabled()) {
    logger.debug('Handling SystemInfo request');
  }

  const compatMode = System.getCompatibilityMode();
  const compatModeFormatted =
    Math.floor(compatMode / 100) + '.' + (compatMode % 100);

  // OCAPI version is only available for OCAPI requests
  var ocapiVersion = null;
  try {
    ocapiVersion = request.ocapiVersion;
  } catch (e) {
    // Not an OCAPI request
  }

  res.json({
    superpilot: {
      enabled: config.ENABLED,
      pathPrefix: config.PATH_PREFIX,
      sitemapSuffix: config.SITEMAP_SUFFIX,
      cacheTime: config.CACHE_TIME,
      serviceURL: getServiceURL(),
    },
    compatibilityMode: {
      raw: compatMode,
      formatted: compatModeFormatted,
    },
    instance: {
      hostname: System.getInstanceHostname(),
      type: getInstanceTypeName(System.getInstanceType()),
      timeZone: System.getInstanceTimeZone(),
    },
    site: {
      id: Site.getCurrent().getID(),
      name: Site.getCurrent().getName(),
    },
    ocapiVersion: ocapiVersion,
  });

  return next();
});

function getInstanceTypeName(type) {
  switch (type) {
    case System.DEVELOPMENT_SYSTEM:
      return 'development';
    case System.STAGING_SYSTEM:
      return 'staging';
    case System.PRODUCTION_SYSTEM:
      return 'production';
    default:
      return 'unknown';
  }
}

module.exports = server.exports();
