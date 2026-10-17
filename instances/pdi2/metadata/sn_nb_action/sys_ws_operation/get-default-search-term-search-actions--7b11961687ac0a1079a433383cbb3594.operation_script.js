(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var requestBody = request.body.data;
        var currentRecordTable = requestBody.table_name;
        var recordSysId = requestBody.sysId;
        var ruleContextId = requestBody.context_sys_id;
        var includeActionDetails = requestBody.includeActionDetails;
        var contextInputs = requestBody.contextInputs;
        var currentDefaultSearchTerm = requestBody.default_search_term;
        var filter = requestBody.filter;
        var selectedFacetFilters = requestBody.facet_filter;
        var selectedSortFilter = requestBody.sort_filter;
		var shouldLogSignals = requestBody.shouldLogSignals;

        var nextBestActionService = new sn_nb_action.NextBestActionService();
        var result = nextBestActionService.getDefaultSearchTermSearchActions(currentRecordTable, recordSysId, ruleContextId, currentDefaultSearchTerm, filter, selectedFacetFilters, selectedSortFilter, includeActionDetails, contextInputs, shouldLogSignals);
        if (result) {
            response.setBody(result);
        } else {
            response.setBody([]);
        }
        response.setStatus(200);
    } catch (err) {
        gs.error("Get default search term search actions failed : " + JSON.stringify(err));
        response.setBody([]);
        response.setStatus(200);
    }

})(request, response);
