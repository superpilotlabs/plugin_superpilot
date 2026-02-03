'use strict';

const Logger = require('dw/system/Logger');
const URLRedirectMgr = require('dw/web/URLRedirectMgr');
const server = require('server');
const { fetch } = require('*/cartridge/scripts/superpilot/proxy');
const { ENABLED, SITEMAP_SUFFIX, CACHE_TIME } = require('*/cartridge/scripts/superpilot/config');

const logger = Logger.getLogger('superpilot', 'superpilot.controllers.SiteMap');

function SuperpilotSiteMap(_req, res, next) {
  if (!ENABLED) {
    return next();
  }

  const path = URLRedirectMgr.getRedirectOrigin();
  const sitemapPath = '/sitemap-' + SITEMAP_SUFFIX + '.xml';
  if (path.indexOf(sitemapPath) !== 0) {
    return next();
  }

  if (logger.isDebugEnabled()) {
    logger.debug('Sitemap: {0}', path);
  }

  try {
    const fetchResponse = fetch('/sitemap.xml');
    if (fetchResponse.ok) {
      if (CACHE_TIME) {
        response.setExpires(new Date(Date.now() + CACHE_TIME * 1000));
      }
      if (fetchResponse.requestId) {
        response.setHttpHeader('X-SF-CC-Superpilot-Request-Id', fetchResponse.requestId);
      }
      response.setContentType('application/xml');
      response.getWriter().print(fetchResponse.body);
      return;
    }
    logger.error(
      'Sitemap error: url={0}, status={1}, requestId={2}',
      fetchResponse.url,
      fetchResponse.status,
      fetchResponse.requestId
    );
  } catch (error) {
    logger.error('Sitemap error: path={0}, message={1}', path, error.message);
  }

  return next();
}

if (module.superModule) {
  server.extend(module.superModule);
  server.prepend('Google', SuperpilotSiteMap);
} else {
  server.get('Google', SuperpilotSiteMap);
}
module.exports = server.exports();
