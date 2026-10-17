var LOG_PREFIX = 'EM - EventRuleUI16CompatibilityUpdater Fix Script';
try {
    var eventRuleUI16CompatibilityUpdater = new EvtMgmtEventRuleUI16CompatibilityUpdater();
    var result = eventRuleUI16CompatibilityUpdater.processAllEventRules();
    var message = LOG_PREFIX + ' - Completed\n' +
        'Start: ' + result.startTime + ',\n' +
        'End: ' + result.endTime + ',\n' +
        'Duration: ' + result.durationSeconds.toFixed(2) + 's,\n' +
        'Processed: ' + result.stats.total + ',\n' +
        'Updated: ' + result.stats.updated + ',\n' +
        'Skipped: ' + result.stats.skipped + ',\n' +
        'Errors: ' + result.stats.errors;
    gs.info(message);
} catch (e) {
    gs.error(LOG_PREFIX + " failed: " + e.message);
}
