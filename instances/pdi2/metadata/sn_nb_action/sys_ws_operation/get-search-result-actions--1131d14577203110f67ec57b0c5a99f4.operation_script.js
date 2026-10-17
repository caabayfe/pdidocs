(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var requestBody = request.body.data;
    var searchTerm = requestBody.search_term;
    var filter = requestBody.filter;
    var currentTable = requestBody.table;
    var currentRecordSysId = requestBody.sys_id;
    var paginationToken = requestBody.paginationToken;
    var selectedFacetFilters = requestBody.facet_filter;
    var selectedSortFilter = requestBody.sort_filter;
    var ruleContextId = requestBody.context_sys_id;
    var contextInputs = requestBody.contextInputs;
    var shouldLogSignals = requestBody.shouldLogSignals;
    if (!sn_nb_action.NextBestActionUtil.isValidString(currentRecordSysId) || !sn_nb_action.NextBestActionUtil.isValidString(currentTable))
        response.setError(new sn_ws_err.BadRequestError(gs.getMessage('Missing required parameters')));
    else {
        try {
            var nbaService = new sn_nb_action.NextBestActionService();
            var result = nbaService.getSearchResultActions(currentTable, currentRecordSysId, searchTerm, filter, paginationToken, selectedFacetFilters, selectedSortFilter, ruleContextId, contextInputs, shouldLogSignals);
            if (result) {
                response.setBody(result);
                response.setStatus(200);
            } else {
                response.setBody([]);
                response.setStatus(200);
            }
        } catch (err) {
            gs.error("Get search recommendations : " + JSON.stringify(err));
            response.setBody([]);
            response.setStatus(200);
        }
    }
})(request, response);
