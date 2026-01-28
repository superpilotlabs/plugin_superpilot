'use strict';

var File = require('dw/io/File');
var FileWriter = require('dw/io/FileWriter');
var Site = require('dw/system/Site');
var Status = require('dw/system/Status');
var SitemapMgr = require('dw/sitemap/SitemapMgr');
var Logger = require('dw/system/Logger');

var proxy = require('*/cartridge/scripts/superpilot/proxy');

var log = Logger.getLogger('superpilot', 'jobs');

/**
 * Job step to import Superpilot sitemap into SFCC's native sitemap infrastructure.
 *
 * @param {Object} params - Job step parameters
 * @param {string} params.SitemapPath - Remote path to fetch (default: /sitemap.xml)
 * @param {string} params.TargetFilename - Local filename (default: sitemap-superpilot.xml)
 * @param {string} params.Hostname - Override hostname for registration
 * @param {boolean} params.DeleteExisting - Remove old Superpilot sitemaps first
 * @param {dw.job.JobStepExecution} stepExecution - Job step execution context
 * @returns {dw.system.Status} Job status
 */
function execute(params, stepExecution) {
    var sitemapPath = params.SitemapPath || '/sitemap.xml';
    var targetFilename = params.TargetFilename || 'superpilot-sitemap.xml';
    var hostname = params.Hostname || Site.getCurrent().getHttpsHostName();
    var deleteExisting = params.DeleteExisting === true;

    log.info('Starting Superpilot sitemap import: path={0}, filename={1}, hostname={2}',
        sitemapPath, targetFilename, hostname);

    var tempFile = null;

    try {
        // 1. Fetch sitemap from Superpilot
        var response;
        try {
            response = proxy.fetch(sitemapPath);
        } catch (fetchError) {
            log.error('Failed to fetch sitemap from Superpilot: {0}', fetchError.message);
            return new Status(Status.ERROR, 'FETCH_FAILED', fetchError.message);
        }

        if (!response.ok) {
            log.error('Sitemap fetch returned non-OK status: {0}', response.status);
            return new Status(Status.ERROR, 'FETCH_FAILED', 'HTTP status: ' + response.status);
        }

        var sitemapContent = response.body;
        log.info('Fetched sitemap content: {0} bytes', sitemapContent.length);

        // 2. Write to temp file
        var tempDir = new File(File.IMPEX + '/temp/superpilot');
        if (!tempDir.exists()) {
            tempDir.mkdirs();
        }

        tempFile = new File(tempDir, targetFilename);
        var writer = null;
        try {
            writer = new FileWriter(tempFile, 'UTF-8');
            writer.write(sitemapContent);
            writer.flush();
        } catch (writeError) {
            log.error('Failed to write sitemap to temp file: {0}', writeError.message);
            return new Status(Status.ERROR, 'WRITE_FAILED', writeError.message);
        } finally {
            if (writer) {
                writer.close();
            }
        }

        log.info('Wrote sitemap to temp file: {0}', tempFile.fullPath);

        // 3. Delete existing Superpilot sitemaps if requested
        if (deleteExisting) {
            var existingFiles = SitemapMgr.getCustomSitemapFiles(hostname);
            if (existingFiles) {
                var iterator = existingFiles.iterator();
                while (iterator.hasNext()) {
                    var existingFile = iterator.next();
                    var fileName = existingFile.name;
                    if (fileName.indexOf('superpilot') !== -1) {
                        log.info('Deleting existing Superpilot sitemap: {0}', fileName);
                        SitemapMgr.deleteCustomSitemapFile(hostname, existingFile);
                    }
                }
            }
        }

        // 4. Register sitemap with SitemapMgr
        SitemapMgr.addCustomSitemapFile(hostname, tempFile);
        log.info('Registered sitemap with SitemapMgr for hostname: {0}', hostname);

        // 5. Cleanup temp file
        if (tempFile.exists()) {
            tempFile.remove();
            log.info('Removed temp file after registration');
        }

        log.info('Superpilot sitemap import completed successfully');
        return new Status(Status.OK, 'SUCCESS');

    } catch (e) {
        log.error('Unexpected error during sitemap import: {0}\n{1}', e.message, e.stack);

        // Cleanup on error
        if (tempFile && tempFile.exists()) {
            try {
                tempFile.remove();
            } catch (cleanupError) {
                log.warn('Failed to cleanup temp file: {0}', cleanupError.message);
            }
        }

        return new Status(Status.ERROR, 'EXCEPTION', e.message);
    }
}

module.exports = {
    execute: execute
};
