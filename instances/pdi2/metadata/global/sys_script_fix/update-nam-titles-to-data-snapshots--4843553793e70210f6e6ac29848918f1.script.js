function updateColumnLabel(tableName, elementName, oldLabel, newLabel) {
    var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', tableName);
    gr.addQuery('element', elementName);
    gr.addQuery('column_label', oldLabel);
    gr.query();
    if (gr.next()) {
        gr.setValue('column_label', newLabel);
        if (gr.update()) {
            gs.log("Updated the column label of '" + elementName + "' column for table '" + tableName + "' from '" + oldLabel + "' to '" + newLabel + "'");
        } else {
            gs.logError("Failed to update the column label of '" + elementName + "' column for table '" + tableName + "'");
        }
    }
}

function updateTableTitle(tableName, newTitle, pluralTitle) {
    // Update sys_documentation
    var docGr = new GlideRecord('sys_documentation');
    docGr.addQuery('name', tableName);
    docGr.addQuery('element', null);
    docGr.query();

    if (docGr.next()) {
        docGr.setValue('label', newTitle);
        docGr.setValue('plural', pluralTitle);
        if (docGr.update()) {
            gs.log("Updated sys_documentation for table '" + tableName + "' with new label '" + newTitle + "' and plural label '" + pluralTitle + "'");
        } else {
            gs.logError("Failed to update sys_documentation for table '" + tableName + "'");
        }
    } else {
        gs.logError("No sys_documentation record found for table '" + tableName + "'");
    }

    // Update sys_db_object
    var gr = new GlideRecord('sys_db_object');
    gr.addQuery('name', tableName);
    gr.query();
    if (gr.next()) {
        gr.setValue('label', newTitle);
        if (gr.update()) {
            gs.log("Updated the title of table '" + tableName + "' to '" + newTitle + "'");
        } else {
            gs.logError("Failed to update the title of table '" + tableName + "'");
        }
    } else {
        gs.logError("Failed to update title of Table '" + tableName + "'. Table not found");
    }
}
// Column label updates
updateColumnLabel('pa_dm_analytics_source', 'is_data_collection_enabled', 'Enable Data Collection', 'Data collection enabled');
updateColumnLabel('pa_dm_analytics_source', 'run_as_tz', 'Time Zone', 'Time zone');
// Table title updates
updateTableTitle('syslog_pa_dm', 'Data Snapshots Logs', 'Data Snapshots Logs');
updateTableTitle('pa_dm_task_telemetry', 'Data Snapshots Statistics', 'Data Snapshots Statistics');
updateTableTitle('sysauto_dm_cdc_collector', 'Scheduled Data Collection', 'Scheduled Data Collections');
