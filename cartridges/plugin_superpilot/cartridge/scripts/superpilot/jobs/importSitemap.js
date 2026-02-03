'use strict';

const File = require('dw/io/File');
const FileWriter = require('dw/io/FileWriter');
const Site = require('dw/system/Site');
const Status = require('dw/system/Status');
const SitemapMgr = require('dw/sitemap/SitemapMgr');
const Logger = require('dw/system/Logger');

const proxy = require('*/cartridge/scripts/superpilot/proxy');
const config = require('*/cartridge/scripts/superpilot/config');

const log = Logger.getLogger('superpilot', 'superpilot.jobs.importSitemap');

/**
 * Job step to import a Superpilot sitemap as a custom sitemap.
 *
 * @param {Object} params - Job step parameters
 * @param {string} params.Hostname - Override hostname for registration
 * @param {dw.job.JobStepExecution} stepExecution - Job step execution context
 * @returns {dw.system.Status} Job status
 */
function execute(params, _stepExecution) {
  if (!config.ENABLED) {
    log.info('Disabled - skipping sitemap import');
    return new Status(Status.OK, 'SKIPPED', 'Superpilot is disabled');
  }

  const hostname = params.Hostname || Site.getCurrent().getHttpsHostName();
  const targetFilename = config.SITEMAP_SUFFIX + '.xml';

  log.info(
    'Starting Superpilot sitemap import: hostname={0}, filename={1}',
    hostname,
    targetFilename
  );

  let tempFile;

  try {
    // 1. Fetch sitemap from Superpilot
    let fetchResponse;
    try {
      fetchResponse = proxy.fetch('/sitemap.xml');
    } catch (fetchError) {
      log.error('Fetch error: message={0}', fetchError.message);
      return new Status(Status.ERROR, 'FETCH_FAILED', fetchError.message);
    }

    if (!fetchResponse.ok) {
      logger.error(
        'Fetch error: url={0}, status={1}, requestId={2}',
        fetchResponse.url,
        fetchResponse.status,
        fetchResponse.requestId
      );
      return new Status(Status.ERROR, 'FETCH_FAILED', 'HTTP status: ' + fetchResponse.status);
    }

    const sitemapContent = fetchResponse.body;
    log.info('Sitemap: {0} bytes, requestId={1}', sitemapContent.length, fetchResponse.requestId);

    // 2. Write to temp file
    let tempDir = new File(File.TEMP + '/superpilot/sitemap');
    if (!tempDir.exists()) {
      tempDir.mkdirs();
    }

    tempFile = new File(tempDir, targetFilename);
    let writer;
    try {
      writer = new FileWriter(tempFile, 'UTF-8');
      writer.write(sitemapContent);
      writer.flush();
    } catch (writeError) {
      logger.error('Write error: message={0}', writeError.message);
      return new Status(Status.ERROR, 'WRITE_FAILED', writeError.message);
    } finally {
      if (writer) {
        writer.close();
      }
    }

    log.info('Wrote sitemap: filename={0}', tempFile.fullPath);

    // 3. Register sitemap with SitemapMgr (overwrites if exists)
    SitemapMgr.addCustomSitemapFile(hostname, tempFile);
    log.info('Registered sitemap: hostname={0}', hostname, tempFile.fullPath);

    // 4. Cleanup temp file
    if (tempFile.exists()) {
      tempFile.remove();
      log.info('Removed temp file: filename={0}', tempFile.fullPath);
    }

    log.info('Import completed successfully');
    return new Status(Status.OK, 'SUCCESS');
  } catch (e) {
    log.error('Error: message={0} stack={1}', e.message, e.stack);

    // Cleanup on error
    if (tempFile && tempFile.exists()) {
      try {
        tempFile.remove();
      } catch (cleanupError) {
        log.warn('Cleanup failed: message={0}', cleanupError.message);
      }
    }

    return new Status(Status.ERROR, 'EXCEPTION', e.message);
  }
}

module.exports = {
  execute: execute,
};
