"use strict";

const server = require("server");
const {
  fetch,
  handle404,
  PATH_PREFIX,
} = require("*/cartridge/scripts/superpilot/proxy");
const URLRedirectMgr = require("dw/web/URLRedirectMgr");

function Start(_req, res, next) {
  const path = URLRedirectMgr.getRedirectOrigin();
  if (!path.startsWith(PATH_PREFIX)) {
    return handle404(res, next);
  }

  try {
    const response = fetch(path);
    if (!response.ok) {
      return handle404(res, next);
    }
    res.print(response.body);
  } catch (error) {
    res.setStatusCode(500);
    res.json({ url, error: error.toString() });
  }

  return next();
}

server.get("Start", Start);

// server.extend(module.superModule);
// server.prepend("Start", Start);

module.exports = server.exports();
