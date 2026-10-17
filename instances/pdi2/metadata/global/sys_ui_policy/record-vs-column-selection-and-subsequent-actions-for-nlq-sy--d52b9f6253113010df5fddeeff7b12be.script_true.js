function onCondition() {
    //to set default table to CI Relationship Type
    if (g_form.getValue('table') == '') {
        var defaultTable = "cmdb_rel_type";
        g_form.setValue('table', defaultTable);
    }
    //to display a message containing the list of tables supported for Record Synonym Type
    var allowedTables = ['cmdb_rel_type', 'cmdb_group', 'cmdb_ci_service_technical', 'cmdb_ci_service_discovered', 'cmdb_ci_query_based_service'];
    var displayMsg = "Supported tables for Synonym Type Record: " + allowedTables.join();
    g_form.showFieldMsg('synonym_type', displayMsg, "", 'false');
}
