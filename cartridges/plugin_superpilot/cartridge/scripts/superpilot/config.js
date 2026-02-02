'use strict';

const Site = require('dw/system/Site');

module.exports = {
  PATH_PREFIX: Site.getCurrent().getCustomPreferenceValue('superpilotPathPrefix') || '/landing',
  // Cache time in seconds for successful responses. Set to null to disable caching.
  CACHE_TIME: Site.getCurrent().getCustomPreferenceValue('superpilotCacheTime') || null,
};
