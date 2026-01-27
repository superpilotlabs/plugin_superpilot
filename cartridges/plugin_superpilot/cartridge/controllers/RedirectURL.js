'use strict';

const server = require('server');
const { fetch, PATH_PREFIX } = require('*/cartridge/scripts/superpilot/proxy');
const URLRedirectMgr = require('dw/web/URLRedirectMgr');

function SuperpilotPage(_req, _res, next) {
  const path = URLRedirectMgr.getRedirectOrigin();
  if (path.indexOf(PATH_PREFIX) !== 0) {
    return next();
  }

  try {
    const fetchResponse = fetch(path);
    if (fetchResponse.ok) {
      response.getWriter().print(fetchResponse.body);
      return;
    }
  } catch (_error) {}

  return next();
}

server.extend(module.superModule);
server.prepend('Start', SuperpilotPage);
module.exports = server.exports();
