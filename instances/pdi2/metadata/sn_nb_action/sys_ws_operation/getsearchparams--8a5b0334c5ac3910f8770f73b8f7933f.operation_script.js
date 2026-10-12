(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var receivedParams = request.pathParams;
    var currentRecordTable = receivedParams.table_name;
    var queryParams = request.queryParams;
    var ruleContextId;
    if (queryParams.hasOwnProperty("contextSysId"))
        ruleContextId = queryParams.contextSysId[0];

    response.setContentType('application/json');

    if (!sn_nb_action.NextBestActionUtil.isValidString(currentRecordTable))
        response.setError(new sn_ws_err.BadRequestError(gs.getMessage('Missing required parameters')));
    else {
        try {
            var aisHandler = new sn_nb_action.AISearchGeneratorTypeHandler();
            var nbaDao = new sn_nb_action.NextBestActionDAO();
            var ruleContext = nbaDao.getRuleContext(currentRecordTable, ruleContextId);
            var searchConfigId = ruleContext.search_application_configuration;
            var searchSources = aisHandler._fetchSearchSources(ruleContext);
            var filters = aisHandler._getSearchFilters(searchConfigId, searchSources);
            var applicableSortOptions = aisHandler._getSortOptions(searchConfigId);
            var result = {
                filters: filters,
                applicableSortOptions: applicableSortOptions,
                searchConfigId: searchConfigId
            };
            if (result) {
                response.setBody(result);
                response.setStatus(200);
            } else {
                response.setBody([]);
                response.setStatus(200);
            }

        } catch (err) {
            gs.error("Get search parameters failed : " + JSON.stringify(err));
            response.setBody([]);
            response.setStatus(200);
        }
    }
})(request, response);
