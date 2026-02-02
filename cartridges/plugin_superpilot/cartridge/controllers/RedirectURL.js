'use strict';

const Logger = require('dw/system/Logger');
const URLRedirectMgr = require('dw/web/URLRedirectMgr');
const server = require('server');
const { fetch, PATH_PREFIX } = require('*/cartridge/scripts/superpilot/proxy');
const { CACHE_TIME } = require('*/cartridge/scripts/superpilot/config');

const logger = Logger.getLogger('superpilot', 'superpilot.controllers.RedirectURL');

function SuperpilotPage(_req, _res, next) {
  const path = URLRedirectMgr.getRedirectOrigin();
  if (path.indexOf(PATH_PREFIX) !== 0) {
    return next();
  }

  const queryString = request.httpQueryString;
  const fullPath = queryString ? path + '?' + queryString : path;

  if (logger.isDebugEnabled()) {
    logger.debug('Page: {0}', fullPath);
  }

  try {
    const fetchResponse = fetch(fullPath);
    if (fetchResponse.ok) {
      if (CACHE_TIME) {
        response.setExpires(new Date(Date.now() + CACHE_TIME * 1000));
      }
      if (fetchResponse.requestId) {
        response.setHttpHeader('X-SF-CC-Superpilot-Request-Id', fetchResponse.requestId);
      }
      response.getWriter().print(fetchResponse.body);
      return;
    }
    logger.error(
      'Page error: url={0}, status={1}, requestId={2}',
      fetchResponse.url,
      fetchResponse.status,
      fetchResponse.requestId
    );
  } catch (error) {
    logger.error('Page error: path={0}, message={1}', path, error.message);
  }

  return next();
}

server.extend(module.superModule);
server.prepend('Start', SuperpilotPage);
module.exports = server.exports();
