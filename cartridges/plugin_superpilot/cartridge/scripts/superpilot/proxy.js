'use strict';

const LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
const HTTPClient = require('dw/net/HTTPClient');
const HashMap = require('dw/util/HashMap');

const { PATH_PREFIX } = require('*/cartridge/scripts/superpilot/config');

/**
 * Returns a case-insensitive getter for a headers map.
 * @param {dw.util.Map} map - Response headers map.
 * @returns {Function} Getter function that accepts a header name.
 */
function createHeaderGetter(map) {
  const normalized = new HashMap();
  for (var key in map) {
    normalized.put(key.toLowerCase(), map[key]);
  }
  return function (name) {
    return normalized.get(name.toLowerCase());
  };
}

function fetch(path) {
  const service = LocalServiceRegistry.createService('Superpilot', {
    execute: function (svc) {
      const client = new HTTPClient();
      client.open('GET', svc.getURL());
      client.send();
      return client;
    },
    parseResponse: function (_svc, client) {
      const getHeader = createHeaderGetter(client.getAllResponseHeaders());
      return {
        status: client.statusCode,
        body: client.text,
        ok: client.statusCode >= 200 && client.statusCode < 300,
        requestId: getHeader('x-amz-cf-id') || null,
      };
    },
  });

  const serviceCredentials = service.getConfiguration().getCredential();
  const url = serviceCredentials.getURL() + path;
  service.setURL(url);

  const result = service.call();
  if (!result.ok) {
    throw new Error('Service error: ' + result.errorMessage);
  }

  const response = result.object;
  response.url = url;
  return response;
}

module.exports = {
  fetch: fetch,
  PATH_PREFIX: PATH_PREFIX,
};
