(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
    var requestBody = request.body.data;
    var currentRecordTable = requestBody.table;
    var currentRecordSysId = requestBody.sysId;
    var actionInputs = requestBody.actionInputs;
    var actionType = requestBody.actionType;
    var actionId = requestBody.actionId;
    var ruleContextId = requestBody.contextSysId;

    response.setContentType('application/json');
    if (!sn_nb_action.NextBestActionUtil.isValidString(currentRecordTable) || !sn_nb_action.NextBestActionUtil.isValidString(currentRecordSysId) || !sn_nb_action.NextBestActionUtil.isValidString(actionType) || !sn_nb_action.NextBestActionUtil.isValidString(actionId))
        response.setError(new sn_ws_err.BadRequestError(gs.getMessage('Missing required parameters')));
    else {
        try {
            var nbaService = new sn_nb_action.NextBestActionService();
            var result = {};
            var actionDetailId = nbaService.createSearchExecutionRecord(currentRecordTable, currentRecordSysId, actionType, actionInputs, actionId, ruleContextId);
            if (actionDetailId) {
                result.actionDetailId = actionDetailId;
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
            gs.error("Create search result execution record failed : " + JSON.stringify(err));
            var customErrObj = new sn_ws_err.ServiceError();
            customErrObj.setStatus(500);
            customErrObj.setMessage(gs.getMessage('Error getting actions'));
            customErrObj.setDetail(gs.getMessage('Refer error logs for details'));
            response.setError(customErrObj);
        }
    }

})(request, response);
