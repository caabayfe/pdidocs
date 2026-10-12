var gr = new GlideRecord('sys_dictionary');
//Changing the label of CI column from the default Configuration Item to Primary record to generalize labels to support non-cmdb tables
//Changing CI label for tables cmdb_multisource_data, cmdb_multisource_query_result
gr.addQuery('name', 'IN', 'cmdb_multisource_data,cmdb_multisource_query_result');
gr.addQuery('element', 'ci');
gr.addQuery('column_label', 'Configuration Item');
gr.query();
while (gr.next()) {
    gr.setValue('column_label', 'Primary Record');
    if (gr.update()) {
        gs.log("Updated the label of CI element for " + gr.getValue("name"));
    } else {
        gs.logError("Failed to update the label of CI element for " + gr.getValue("name"));
    }
}
