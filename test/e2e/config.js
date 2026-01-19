export const config = {
  hostname: process.env.SFCC_HOSTNAME || 'blwf-001.dx.commercecloud.salesforce.com',
  siteId: process.env.SFCC_SITE_ID || 'RefArch',
  testLandingSlug: process.env.TEST_LANDING_SLUG || 'statement-mini-dresses-for-parties-a56e63f6',
};

export function buildUrl(path) {
  return `https://${config.hostname}/s/${config.siteId}${path}`;
}
