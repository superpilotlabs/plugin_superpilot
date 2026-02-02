'use strict';

const Logger = require('dw/system/Logger');
const URLRedirectMgr = require('dw/web/URLRedirectMgr');
const server = require('server');
const { fetch, PATH_PREFIX } = require('*/cartridge/scripts/superpilot/proxy');

const logger = Logger.getLogger('superpilot', 'controllers.RedirectURL');

function SuperpilotPage(_req, _res, next) {
  const path = URLRedirectMgr.getRedirectOrigin();
  if (path.indexOf(PATH_PREFIX) !== 0) {
    return next();
  }

  if (logger.isDebugEnabled()) {
    logger.debug('Page: {0}', path);
  }

  try {
    const fetchResponse = fetch(path);
    if (fetchResponse.ok) {
      response.getWriter().print(fetchResponse.body);
      return;
    }
    logger.error('Page non-OK status: {0}', fetchResponse.status);
  } catch (error) {
    logger.error('Page error: {0}', error.message);
  }

  return next();
}

server.extend(module.superModule);
server.prepend('Start', SuperpilotPage);
module.exports = server.exports();