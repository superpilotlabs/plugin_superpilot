"use strict";
const URLRedirectMgr = require("dw/web/URLRedirectMgr");
const { fetch } = require("*/cartridge/scripts/superpilot/proxy");
const server = require("server");

function Start(_req, res, next) {
  const path = URLRedirectMgr.getRedirectOrigin();
  if (!path.startsWith("/sitemap-pages.xml")) {
    return next();
  }

  try {
    const response = fetch("/sitemap.xml");
    if (!response.ok) {
      return next();
    }
    res.setContentType("application/xml");
    res.print(response.body);
  } catch (error) {
    res.setStatusCode(500);
    res.json({ url, error: error.toString() });
  }

  return next();
}

// server.get("Google", Start);

server.extend(module.superModule);
server.prepend("Google", Start);

module.exports = server.exports();
