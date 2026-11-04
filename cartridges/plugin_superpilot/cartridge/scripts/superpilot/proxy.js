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
  for (let key in map) {
    normalized.put(key.toLowerCase(), map[key]);
  }
  return function (name) {
    return normalized.get(name.toLowerCase());
  };
}

var DEFAULT_TIMEOUT = 5000;

/**
 * Response headers from Superpilot that never reach the shopper; every other header does, so a
 * header Superpilot starts sending needs no cartridge change. Hop-by-hop headers belong to one
 * connection, the body is re-written so its encoding and length no longer hold, the storefront's
 * domain owns its cookies and HSTS, B2C's page cache owns caching (`superpilotCacheTime`), and the
 * rest name Superpilot's CDN rather than the page. `Content-Type` is applied with
 * `setContentType`, which B2C requires.
 */
const BLOCKED_RESPONSE_HEADERS = [
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'proxy-connection',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'content-encoding',
  'content-length',
  'set-cookie',
  'strict-transport-security',
  'alt-svc',
  'cache-control',
  'expires',
  'pragma',
  'age',
  'date',
  'server',
  'via',
  'x-cache',
  'x-amz-cf-id',
  'x-amz-cf-pop',
];

/**
 * Lists a headers map as `[name, value]` pairs, one per value, with lower-cased names.
 * @param {dw.util.Map} map - Response headers map; each value is a list of header values.
 * @returns {Array<Array<string>>} Header pairs.
 */
function listHeaders(map) {
  const pairs = [];
  for (let key in map) {
    const values = map[key];
    const list = values && values.toArray ? values.toArray() : [values];
    for (let i = 0; i < list.length; i++) {
      pairs.push([key.toLowerCase(), String(list[i])]);
    }
  }
  return pairs;
}

/**
 * Writes Superpilot's response headers onto the storefront response, except the blocked ones.
 * @param {dw.system.Response} res - The storefront response.
 * @param {Array<Array<string>>} headers - Header pairs from `fetch`.
 */
function applyHeaders(res, headers) {
  for (let i = 0; i < headers.length; i++) {
    const name = headers[i][0];
    const value = headers[i][1];
    if (name === 'content-type') {
      res.setContentType(value);
    } else if (BLOCKED_RESPONSE_HEADERS.indexOf(name) === -1) {
      res.addHttpHeader(name, value);
    }
  }
}

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
      const allHeaders = client.getAllResponseHeaders();
      const getHeader = createHeaderGetter(allHeaders);
      return {
        status: client.statusCode,
        body: client.text,
        ok: client.statusCode >= 200 && client.statusCode < 300,
        requestId: getHeader('x-amz-cf-id') || null,
        headers: listHeaders(allHeaders),
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
  applyHeaders: applyHeaders,
};
