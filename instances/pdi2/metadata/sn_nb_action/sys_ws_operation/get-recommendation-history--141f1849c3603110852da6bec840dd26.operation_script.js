(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var receivedParams = request.pathParams;
    var currentRecordTable = receivedParams.table_name;
    var currentRecordSysId = receivedParams.sys_id;
    var queryParams = request.queryParams;
    var ruleContextId;
    if (queryParams.hasOwnProperty("contextSysId"))
        ruleContextId = queryParams.contextSysId[0];

    response.setContentType('application/json');

    if (!sn_nb_action.NextBestActionUtil.isValidString(currentRecordSysId) || !sn_nb_action.NextBestActionUtil.isValidString(currentRecordTable))
        response.setError(new sn_ws_err.BadRequestError(gs.getMessage('Missing required parameters')));
    else {
        try {
            var nbaService = new sn_nb_action.NextBestActionService();
            var result = nbaService.getRecommendationHistory(currentRecordSysId, currentRecordTable, ruleContextId);
            if (result) {
                response.setBody(result);
                response.setStatus(200);
            } else {
                response.setBody([]);
                response.setStatus(200);

            }

        } catch (err) {
            gs.error("Get Recommendation history failed! : " + JSON.stringify(err));
            response.setBody([]);
            response.setStatus(200);
        }
    }

})(request, response);
