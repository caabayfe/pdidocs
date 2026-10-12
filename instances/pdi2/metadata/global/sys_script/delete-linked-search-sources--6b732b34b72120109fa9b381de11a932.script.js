(function executeRule(current, previous /*null when async*/ ) {

    var indexedSourceGR = new GlideRecord('ais_datasource');
    indexedSourceGR.addQuery('source', current.source);
    indexedSourceGR.addQuery('sys_id', '!=', current.sys_id);
    indexedSourceGR.setLimit(1);
    indexedSourceGR.setWorkflow(false);
    indexedSourceGR.query();

    // if it is the only index source for the table, delete search source. 
    if (indexedSourceGR.getRowCount() == 0) {
        var searchSourceGR = new GlideRecord('ais_search_source');
        searchSourceGR.addQuery('datasource', current.source);
        searchSourceGR.setWorkflow(false);
        searchSourceGR.query();
        searchSourceGR.setWorkflow(true);
        while (searchSourceGR.next()) {
            gs.log("[AIS] Deleting associated search source " + searchSourceGR.name + " (" + searchSourceGR.sys_id + ")");
            searchSourceGR.deleteRecord();
        }
    }
})(current, previous);
