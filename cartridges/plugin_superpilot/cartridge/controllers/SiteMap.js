'use strict';

const Logger = require('dw/system/Logger');
const URLRedirectMgr = require('dw/web/URLRedirectMgr');
const server = require('server');
const { fetch } = require('*/cartridge/scripts/superpilot/proxy');

const logger = Logger.getLogger('superpilot', 'controllers.SiteMap');

function SuperpilotSiteMap(_req, res, next) {
  const path = URLRedirectMgr.getRedirectOrigin();
  if (path.indexOf('/sitemap-pages.xml') !== 0) {
    return next();
  }

  if (logger.isDebugEnabled()) {
    logger.debug('Sitemap: {0}', path);
  }

  try {
    const fetchResponse = fetch('/sitemap.xml');
    if (fetchResponse.ok) {
      response.setContentType('application/xml');
      response.getWriter().print(fetchResponse.body);
      return;
    }
    logger.error('Sitemap non-OK status: {0}', fetchResponse.status);
  } catch (error) {
    logger.error('Sitemap error: {0}', error.message);
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
