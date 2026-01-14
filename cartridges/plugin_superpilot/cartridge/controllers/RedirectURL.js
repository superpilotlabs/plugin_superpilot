"use strict";

const server = require("server");
const {
  fetch,
  handle404,
  PATH_PREFIX,
} = require("*/cartridge/scripts/superpilot/proxy");
const URLRedirectMgr = require("dw/web/URLRedirectMgr");

server.extend(module.superModule);

server.prepend("Start", function Start(_req, res, next) {
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
});

module.exports = server.exports();
