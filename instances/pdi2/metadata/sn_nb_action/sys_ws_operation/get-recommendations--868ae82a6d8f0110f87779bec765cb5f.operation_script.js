(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var requestBody = request.body.data;
	var currentRecordTable = requestBody.table;
    var currentRecordSysId = requestBody.sysId;
    var recommendationType = requestBody.recommendationType;
	var forceRefresh = requestBody.forceRefresh;
	var fields = requestBody.fields;
	var ruleContextId = requestBody.contextSysId;
	var shouldGroup = true === requestBody.grouping;
	var contextInputs = requestBody.contextInputs;
	var forceSyncRetry = requestBody.forceSyncRetry;
	response.setContentType('application/json');
    if (!sn_nb_action.NextBestActionUtil.isValidString(currentRecordSysId) || !sn_nb_action.NextBestActionUtil.isValidString(currentRecordTable) || !sn_nb_action.NextBestActionUtil.isValidString(recommendationType))
        response.setError(new sn_ws_err.BadRequestError(gs.getMessage('Missing required parameters')));
    else {
        try {
            var nbaService = new sn_nb_action.NextBestActionService();
            var result = nbaService.getRecommendations(currentRecordTable, currentRecordSysId, recommendationType, forceRefresh, fields, shouldGroup, ruleContextId, forceSyncRetry, contextInputs);
            if (result) {
				response.setBody(result);
                response.setStatus(200);
            } else {
                response.setBody([]);
                response.setStatus(200);
            }

        } catch (err) {
            gs.error("Get Recommendations failed with error : " + JSON.stringify(err));
            response.setBody([]);
            response.setStatus(200);
        }
    }

})(request, response);
