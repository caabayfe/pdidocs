// This fix script populated sys_class_name field in all tables extending em_alert_management_action

var log = 'EM - Update ARM Action Class Field\n\n';
var fixScriptStartTime = new GlideDateTime();

// Query 'em_alert_management_action' to check for sys_class_name field 
var tableUtils = new TableUtils('em_alert_management_action');

if (!tableUtils.isValidField('sys_class_name')) {
    //This fix script was created for Tokyo along with the introduction of the sys_class_name column to em_alert_management_action table, so we expect this column to exist before the fix script runs. If this doesn't happen, then we see it as an error.
    gs.error(log + 'em_alert_management_action table does not have the sys_class_name column in its schema. Therefore sys_class_name column for all the records in the inheriting tables has not been set.');
} else {
    populateClassField();
}

log += '\n' + 'Fix script total run time is: ' + (new GlideDateTime().getNumericValue() - fixScriptStartTime.getNumericValue()) + ' milliseconds';
gs.info(log);


function populateClassField() {
    //populate the sys_class_name field in all three tables
    var tables = ['em_alert_man_m2m_rule_flow', 'em_alert_man_m2m_rule_workflow', 'em_launch_application'];

    for (i = 0; i < tables.length; i++) {
        var tableName = tables[i];

        // Take start time
        var startTimeGdt = new GlideDateTime();

        var gr = new GlideRecord(tableName);
        gr.query();
        // populate sys_class_name in all records in table
        gr.setValue('sys_class_name', tableName);
        gr.updateMultiple();

        log += 'Start time for ' + tableName + ': ' + startTimeGdt.getValue() + '\n';
        log += 'End time for ' + tableName + ': ' + new GlideDateTime().getValue() + '\n\n';
    }
}
