"use strict";

const LocalServiceRegistry = require("dw/svc/LocalServiceRegistry");
const HTTPClient = require("dw/net/HTTPClient");
const URLRedirectMgr = require("dw/web/URLRedirectMgr");

const { PATH_PREFIX } = require("*/cartridge/scripts/superpilot/config");

function fetch(path) {
  const service = LocalServiceRegistry.createService("Superpilot", {
    execute: function (svc) {
      const client = new HTTPClient();
      client.open("GET", svc.getURL());
      client.send();
      return client;
    },
    parseResponse: function (_svc, client) {
      return {
        status: client.statusCode,
        body: client.text,
        ok: client.statusCode >= 200 && client.statusCode < 300,
      };
    },
  });

  var serviceCredentials = service.getConfiguration().getCredential();
  var baseURL = serviceCredentials.getURL();

  service.setURL(baseURL + path);

  const result = service.call();
  if (!result.ok) {
    throw new Error("Service error: " + result.errorMessage);
  }

  return result.object;
}

function handle404(res, next) {
  res.setStatusCode(404);
  res.render("error/notFound");
  next();
}

module.exports = {
  fetch,
  PATH_PREFIX,
  handle404,
};
