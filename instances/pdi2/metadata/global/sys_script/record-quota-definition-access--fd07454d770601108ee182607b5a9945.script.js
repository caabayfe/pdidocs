(function executeRule(current, previous /*null when async*/ ) {
    var curruntURLMap = gs.action.getGlideURI().getMap();
    var tableNameInURL = curruntURLMap.get('sysparm_table_name');

    if (!gs.nil(tableNameInURL) && tableNameInURL.equals('license_details')) {
        var sampleMap = new GCFSampleMap();
        sampleMap.put('definition_id', current.getValue('definition_id'));
        sampleMap.put('table_name', current.getTableName());
        GCFCollector.recordUsageEvent('subscription_management', 'definition', 'access', sampleMap);
    }
})(current, previous);
