'use strict';

const URLRedirectMgr = require('dw/web/URLRedirectMgr');
const { fetch } = require('*/cartridge/scripts/superpilot/proxy');
const server = require('server');

function SuperpilotSiteMap(_req, res, next) {
  const path = URLRedirectMgr.getRedirectOrigin();
  if (!path.startsWith('/sitemap-pages.xml')) {
    return next();
  }

  try {
    const fetchResponse = fetch('/sitemap.xml');
    if (fetchResponse.ok) {
      response.setContentType('application/xml');
      response.getWriter().print(fetchResponse.body);
      return;
    }
  } catch (error) {}

  return next();
}

server.extend(module.superModule);
server.prepend('Google', SuperpilotSiteMap);
module.exports = server.exports();
