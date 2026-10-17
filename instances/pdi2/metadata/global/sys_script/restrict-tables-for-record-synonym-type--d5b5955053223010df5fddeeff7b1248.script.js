(function executeRule(current, previous /*null when async*/ ) {

    // Currently we support only cmdb_rel_type, cmdb_group,cmdb_ci_service_technical, cmdb_ci_service_discovered, cmdb_ci_query_based_service tables.
    var allowedTables = {
        'cmdb_rel_type': '1',
        'cmdb_group': '2',
        'cmdb_ci_service_technical': '3',
        'cmdb_ci_service_discovered': '4',
        'cmdb_ci_query_based_service': '5'
    };
    var recordTypeSynonym = 'record';
    var selectedSynonymType = current.synonym_type;
    var selectedTable = current.table;
    if (selectedSynonymType == recordTypeSynonym) {
        var allowed = false;
        if (selectedTable in allowedTables) {
            allowed = true;
        }
        if (!(allowed)) {
            gs.addErrorMessage(gs.getMessage("Synonyms for records from {0} table are not supported. Currently supported tables are: cmdb_rel_type , cmdb_group, cmdb_ci_service_technical, cmdb_ci_service_discovered, cmdb_ci_query_based_service ", [selectedTable]));
            current.setAbortAction(true);
        }
    }


})(current, previous);
