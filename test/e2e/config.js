export const config = {
  hostname: process.env.B2C_HOSTNAME || 'blwf-001.dx.commercecloud.salesforce.com',
  siteId: process.env.B2C_SITE_ID || 'RefArch',
  pagePath: process.env.TEST_PAGE_PATH || '/landing/statement-mini-dresses-for-parties-a56e63f6',
};

export function buildUrl(path) {
  const base = `https://${config.hostname}/s/${config.siteId}/`;
  return new URL(path.replace(/^\//, ''), base).href;
}
