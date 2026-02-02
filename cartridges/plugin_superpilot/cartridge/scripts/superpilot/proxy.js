'use strict';

const LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
const HTTPClient = require('dw/net/HTTPClient');
const HashMap = require('dw/util/HashMap');
const System = require('dw/system/System');

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

var DEFAULT_TIMEOUT = 5000;

function fetch(path) {
  const service = LocalServiceRegistry.createService('Superpilot', {
    execute: function (svc) {
      const client = new HTTPClient();

      // Don't follow redirects
      client.setAllowRedirect(false);

      // Respect service timeout from profile, fallback to default
      const profile = svc.getConfiguration().getProfile();
      const timeout = (profile && profile.getTimeoutMillis()) || DEFAULT_TIMEOUT;
      client.setTimeout(timeout);

      client.open('GET', svc.getURL());
      client.setRequestHeader('X-B2C-Instance', System.getInstanceHostname());
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
};
