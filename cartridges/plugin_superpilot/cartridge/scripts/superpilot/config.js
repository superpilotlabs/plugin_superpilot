'use strict';

const Site = require('dw/system/Site');

module.exports = {
  PATH_PREFIX: Site.getCurrent().getCustomPreferenceValue('superpilotPathPrefix') || '/landing',
};
