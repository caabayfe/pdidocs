var logger = EFLogger.forClass('EFMarkInactiveErrors');
logger.debug("[EF Cleanup] Starting inactive error detection");

try {
    var appGr = new GlideRecord(EFConstants.TABLES.ERROR_SOURCE_APPLICATION);
    appGr.query();

    var totalResults = { totalProcessed: 0, markedInactive: 0, batches: 0, errors: 0 };

    while (appGr.next()) {
        var sourceAppSysId = appGr.getUniqueValue();
        var appName = appGr.getValue(EFConstants.ERROR_SOURCE_APPLICATION_FIELDS.SOURCE_APPLICATION);
        var cleanup = EFErrorUtil.getConfigProp(sourceAppSysId, 'cleanup');
        var inactiveDays = cleanup && cleanup.inactiveDays ? cleanup.inactiveDays : 30;
        var batchSize = cleanup && cleanup.batchSize ? cleanup.batchSize : 10000;

        logger.debug("[EF Cleanup] Processing app: " + appName +
            " with " + inactiveDays + " day threshold and batch size of " + batchSize);

        var result = EFDataManager.markErrorsAsInactive(inactiveDays, batchSize, sourceAppSysId);

        totalResults.totalProcessed += result.totalProcessed;
        totalResults.markedInactive += result.markedInactive;
        totalResults.batches += result.batches;
        totalResults.errors += result.errors;
    }

    logger.debug("[EF Cleanup] Complete. Processed " + totalResults.totalProcessed +
        " records. Marked " + totalResults.markedInactive + " as inactive. " +
        "Errors: " + totalResults.errors);
} catch (e) {
    logger.error("[EF Cleanup] Error executing inactive error cleanup: " + e);
}
