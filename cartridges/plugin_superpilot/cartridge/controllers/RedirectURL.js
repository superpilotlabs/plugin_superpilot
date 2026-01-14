"use strict";

const server = require("server");
const { fetch, PATH_PREFIX } = require("*/cartridge/scripts/superpilot/proxy");
const URLRedirectMgr = require("dw/web/URLRedirectMgr");

function SuperpilotPage(_req, _res, next) {
  const path = URLRedirectMgr.getRedirectOrigin();
  if (!path.startsWith(PATH_PREFIX)) {
    return next();
  }

  try {
    const fetchResponse = fetch(path);
    if (fetchResponse.ok) {
      response.getWriter().print(fetchResponse.body);
      return;
    }
  } catch (error) {}

  return next();
}

server.extend(module.superModule);
server.prepend("Start", SuperpilotPage);
module.exports = server.exports();
