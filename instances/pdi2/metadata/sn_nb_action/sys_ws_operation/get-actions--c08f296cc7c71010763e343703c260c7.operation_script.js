(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var receivedParams = request.pathParams;
    var queryParams = request.queryParams;
    var currentRecordTable = receivedParams.table_name;
    var currentRecordSysId = receivedParams.sys_id;
    var raContextId = receivedParams.ra_context_id;
    var ruleContextId;
    var groupRecommendations = 'true' == receivedParams.grouping;
    if (queryParams.hasOwnProperty("contextSysId"))
        ruleContextId = queryParams.contextSysId[0];

    response.setContentType('application/json');

    if (!sn_nb_action.NextBestActionUtil.isValidString(currentRecordSysId) || !sn_nb_action.NextBestActionUtil.isValidString(currentRecordTable))
        response.setError(new sn_ws_err.BadRequestError(gs.getMessage('Missing required parameters')));
    else {
        try {

            var current = new sn_nb_action.NextBestActionUtil.getNextBestActionDAO().getSecureTableRecordBySysId(currentRecordTable, currentRecordSysId);
            if (!current) {
                response.setError(new sn_ws_err.BadRequestError(gs.getMessage('Invalid parameters')));
                return;
            }


            var nbaService = new sn_nb_action.NextBestActionService();
            var result = nbaService.getActions(current, ruleContextId, groupRecommendations, raContextId);
            if (result) {
                response.setBody(result);
                response.setStatus(200);
            } else {
                var errObj = new sn_ws_err.ServiceError();
                errObj.setStatus(500);
                errObj.setMessage(gs.getMessage('Error getting actions'));
                errObj.setDetail(gs.getMessage('Refer error logs for details'));
                response.setError(errObj);
            }

        } catch (err) {
            var customErrObj = new sn_ws_err.ServiceError();
            customErrObj.setStatus(500);
            customErrObj.setMessage(gs.getMessage('Error getting actions'));
            customErrObj.setDetail(gs.getMessage('Refer error logs for details'));
            response.setError(customErrObj);
        }
    }

})(request, response);
