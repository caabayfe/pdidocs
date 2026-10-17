function updateColumnLabel(tableName, elementName, oldLabel, newLabel) {
    var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', tableName);
    gr.addQuery('element', elementName);
    gr.addQuery('column_label', oldLabel);
    gr.query();
    while (gr.next()) {
        gr.setValue('column_label', newLabel);
        if (gr.update()) {
            gs.log("Updated the column label of '" + elementName + "' column for table '" + tableName + "' to '" + newLabel + "'");
        } else {
            gs.logError("Failed to update the column label of '" + elementName + "' column for table '" + tableName + "'");
        }
    }
}

updateColumnLabel('pa_indicators', 'is_mlb_enabled', 'Unlimited breakdowns enabled', 'Data snapshots enabled');
updateColumnLabel('pa_indicators', 'is_mlb_supported', 'Unlimited breakdowns supported', 'Data snapshots supported');
updateColumnLabel('pa_cdc_indicator_analytics_mapping', 'mlb_start_date', 'Unlimited breakdowns supported from', 'Data snapshots supported from');
