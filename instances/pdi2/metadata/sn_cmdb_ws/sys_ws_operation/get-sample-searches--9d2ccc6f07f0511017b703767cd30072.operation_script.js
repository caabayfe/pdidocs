(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var util = new CMDBWorkspaceUtil();
    var searchData = {};
    var sampleSearchSysIds = [];
    var grs = new GlideRecordSecure('sn_cmdb_ws_nlq_sample_search');
    grs.setLimit(request.queryParams && request.queryParams.resultLimit ?
        request.queryParams.resultLimit :
        DEFAULT_RESULTS_LIMIT);
    grs.orderBy('sys_updated_on');
	grs.setCategory(util.CMDB_WORKSPACE_DB_CATEGORY);
    grs.query();
    while (grs.next()) {
        searchData[grs.getDisplayValue('search_term')] = [];
        sampleSearchSysIds.push(grs.getValue('sys_id'));
    }
    grs = new GlideRecordSecure('sn_cmdb_ws_nlq_sample_search_table');
    grs.addQuery('sample_search', 'IN', sampleSearchSysIds);
	grs.setCategory(util.CMDB_WORKSPACE_DB_CATEGORY);
    grs.query();
    while (grs.next()) {
		var tableName = grs.getValue('table');
		var tableGrs = new GlideRecordSecure(tableName);
        var searchTerm = grs.getDisplayValue('sample_search');
        searchData[searchTerm].push({
            label: tableGrs.getClassDisplayValue(),
            table: tableName
        });
    }
	response.setBody(searchData);

})(request, response);
