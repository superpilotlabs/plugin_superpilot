'use strict';

const LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
const HTTPClient = require('dw/net/HTTPClient');
const System = require('dw/system/System');
const Logger = require('dw/system/Logger');
const Response = require('dw/system/Response');

const logger = Logger.getLogger('superpilot', 'superpilot.proxy');

var DEFAULT_TIMEOUT = 5000;

/**
 * Response headers from Superpilot that never reach the shopper; every other header does, so a
 * header Superpilot starts sending needs no cartridge change. Hop-by-hop headers belong to one
 * connection, the body is re-written so its encoding and length no longer hold, the storefront's
 * domain owns its cookies and site data, HSTS, referrer policy, CORS and error reporting, B2C's page
 * cache owns caching (`superpilotCacheTime`), and the rest name Superpilot's CDN rather than the
 * page. The first part of the list is `BLOCKED_RESPONSE_HEADERS` in `@superpilot/pages`; keep the two
 * equal (superpilotlabs/superpilot `docs/reverse-proxy.md`). `Content-Type` is applied with
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
  'clear-site-data',
  'strict-transport-security',
  'alt-svc',
  'referrer-policy',
  'access-control-allow-origin',
  'access-control-allow-methods',
  'access-control-allow-headers',
  'access-control-allow-credentials',
  'access-control-expose-headers',
  'access-control-max-age',
  'nel',
  'report-to',
  'reporting-endpoints',
  'server',
  'server-timing',
  'via',
  'age',
  'x-cache',
  'x-amz-cf-id',
  'x-amz-cf-pop',
  'x-amzn-trace-id',
  'x-powered-by',
  'content-location',
  'cache-control',
  'expires',
  'pragma',
  'date',
];

/**
 * The public headers B2C lets a script set, keyed by lower-cased name. `addHttpHeader` and
 * `setHttpHeader` accept only these names, spelled exactly as B2C's `Response` constants spell
 * them (`x-robots-tag` is refused, `X-Robots-Tag` is not), plus custom `X-SF-CC-` names.
 */
const SETTABLE_HEADERS = {};
[
  Response.ACCESS_CONTROL_ALLOW_CREDENTIALS,
  Response.ACCESS_CONTROL_ALLOW_HEADERS,
  Response.ACCESS_CONTROL_ALLOW_METHODS,
  Response.ACCESS_CONTROL_ALLOW_ORIGIN,
  Response.ACCESS_CONTROL_EXPOSE_HEADERS,
  Response.ALLOW,
  Response.CONTENT_DISPOSITION,
  Response.CONTENT_LANGUAGE,
  Response.CONTENT_LOCATION,
  Response.CONTENT_MD5,
  Response.CONTENT_SECURITY_POLICY,
  Response.CONTENT_SECURITY_POLICY_REPORT_ONLY,
  Response.CROSS_ORIGIN_EMBEDDER_POLICY,
  Response.CROSS_ORIGIN_EMBEDDER_POLICY_REPORT_ONLY,
  Response.CROSS_ORIGIN_OPENER_POLICY,
  Response.CROSS_ORIGIN_OPENER_POLICY_REPORT_ONLY,
  Response.CROSS_ORIGIN_RESOURCE_POLICY,
  Response.LINK,
  Response.LOCATION,
  Response.PERMISSIONS_POLICY,
  Response.PLATFORM_FOR_PRIVACY_PREFERENCES_PROJECT,
  Response.REFERRER_POLICY,
  Response.REFRESH,
  Response.RETRY_AFTER,
  Response.SERVICE_WORKER_ALLOWED,
  Response.VARY,
  Response.X_CONTENT_TYPE_OPTIONS,
  Response.X_FRAME_OPTIONS,
  Response.X_ROBOTS_TAG,
  Response.X_XSS_PROTECTION,
].forEach(function (name) {
  SETTABLE_HEADERS[String(name).toLowerCase()] = String(name);
});

/**
 * Lists a headers map as `[name, value]` pairs, one per value, with lower-cased names.
 * @param {dw.util.Map} map - Response headers map; each value is a list of header values.
 * @returns {Array<Array<string>>} Header pairs.
 */
function listHeaders(map) {
  // B2C's Rhino binds a const declared in a loop body once, on the first pass, so loop-scoped
  // bindings here are let.
  const pairs = [];
  for (let key in map) {
    let values = map[key];
    let list = values && values.toArray ? values.toArray() : [values];
    for (let i = 0; i < list.length; i++) {
      pairs.push([key.toLowerCase(), String(list[i])]);
    }
  }
  return pairs;
}

/**
 * The name B2C accepts for a lower-cased header name, or undefined when B2C lets no script set it:
 * a `Response` constant's spelling, or a custom `X-SF-CC-` name with that prefix upper-cased.
 * @param {string} name - Lower-cased header name.
 * @returns {string|undefined} The name to set.
 */
function settableName(name) {
  if (/^x-sf-cc-[a-z0-9_-]+$/.test(name)) {
    return 'X-SF-CC-' + name.slice('x-sf-cc-'.length);
  }
  return SETTABLE_HEADERS[name];
}

/**
 * A text content type with no charset gets UTF-8, which is what the writer emits; without it a
 * browser reads the bytes as windows-1252.
 * @param {string} contentType - The content type Superpilot sent.
 * @returns {string} The content type to set.
 */
function withCharset(contentType) {
  return /^text\//i.test(contentType) && !/charset=/i.test(contentType)
    ? contentType + ';charset=utf-8'
    : contentType;
}

/**
 * Writes Superpilot's response headers onto the storefront response, except the blocked ones and
 * any B2C does not let a script set. A header's first value replaces B2C's own, later values are
 * added. A header B2C still refuses, `Content-Type` included, is skipped and logged, so it never
 * costs the shopper the page.
 * @param {dw.system.Response} res - The storefront response.
 * @param {Array<Array<string>>} headers - Header pairs from `fetch`.
 */
function applyHeaders(res, headers) {
  const written = {};
  for (let i = 0; i < headers.length; i++) {
    let name = headers[i][0];
    let value = headers[i][1];
    if (BLOCKED_RESPONSE_HEADERS.indexOf(name) !== -1) {
      continue;
    }
    let settable = settableName(name);
    if (name !== 'content-type' && !settable) {
      logger.debug('Header B2C does not let a script set: {0}', name);
      continue;
    }
    try {
      if (name === 'content-type') {
        res.setContentType(withCharset(value));
      } else if (written[name]) {
        res.addHttpHeader(settable, value);
      } else {
        res.setHttpHeader(settable, value);
        written[name] = true;
      }
    } catch (e) {
      logger.warn('Header refused by B2C: {0} ({1})', name, e.message);
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
      const headers = listHeaders(client.getAllResponseHeaders());
      const requestId = headers.filter(function (pair) {
        return pair[0] === 'x-amz-cf-id';
      })[0];
      return {
        status: client.statusCode,
        body: client.text,
        ok: client.statusCode >= 200 && client.statusCode < 300,
        requestId: requestId ? requestId[1] : null,
        headers: headers,
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
