// Reparent Alert Correlation Rule table (em_alert_correlation_rule) table so it extends sys_metadata
var logPrefix = "Event Management - Alert Correlation Rule to sys_metadata fix script:\n";
gs.info(logPrefix + "Start running the fix script to reparent Alert Correlation Rule table so it will extend sys_metadata.");

var table = "em_alert_correlation_rule";
var gr = new GlideRecord(table);

// Reparent only if the table exists
if (gr.isValid()) {
    var tableUtils = new TableUtils(table);
    var parentTables = tableUtils.getTables();
    if (parentTables && parentTables.indexOf("sys_metadata") > -1) {
        gs.info(logPrefix + 'Abort reparenting of Alert Correlation Rule table (em_alert_correlation_rule) as it already extends sys_metadata.');
    } else {
        var changed = new GlideTableParentChange('em_alert_correlation_rule').change('', 'sys_metadata');
        if (changed) {
            gs.info(logPrefix + 'Succeeded to reparent the Alert Correlation Rule table (em_alert_correlation_rule) to sys_metadata.');
        } else {
            gs.error(logPrefix + 'Failed to reparent the Alert Correlation Rule table (em_alert_correlation_rule) to sys_metadata.');
        }
    }
} else {
    gs.error(logPrefix + 'Alert Correlation Rule table ("' + table + '") does not exist, skipped the reparenting of the table to extend sys_metadata.');
}
