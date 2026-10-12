var processor = new MultiSourceQueryProcessor();
gs.debug("Populating aggregate and raw data charts for multisource workspace dashboard ");
processor.populateCIsBySource();
/**
 * Enable/Disable the coverage charts by passing the active flag as true/false.
 * Passing the active flag as false will only compute the class -> ci records counts from the multisource and not populate the coverage charts
 * These counts are helpful for troubleshooting purposes in case of slow performance of the job
 */
processor.populateCoverageCharts(true);
processor.populateNumberOfDiscoverySources();
processor.populateRawRecords();
processor.populateReconciledCIs();
processor.populateDiscoverySourcesNotReportingCIs();
processor.populateDataMismatch();
gs.debug("Finished calculation of aggregate and raw data for multisource workspace dashboard");

gs.debug("Triggering PA job to calculate dashboard trending charts");
// Invoke the PA scheduled job to draw trends for the aggregated counts
var paJobRecord = new GlideRecord('sysauto_pa');
var paJobName = 'Multisource Dashboard Collection';
paJobRecord.addQuery('name', paJobName);
paJobRecord.query();
if (paJobRecord.next()) {
    gs.debug("Invoking job : '{0}' to calculate trends for aggregated charts", paJobName);
    var paTriggerId = gs.executeNow(paJobRecord);
    gs.info("Triggered job : '{0} ' with trigger id : {1} ", paJobName, paTriggerId);
} else {
    gs.error("Failed to find PA job with name {0} and cannot execute Multisource aggregate trends chart job", paJobName);
}
