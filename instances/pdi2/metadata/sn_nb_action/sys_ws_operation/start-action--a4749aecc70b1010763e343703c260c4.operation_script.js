(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var receivedParams = request.pathParams;
    var currentRecordTable = receivedParams.table_name;
    var currentRecordSysId = receivedParams.sys_id;
    var actionDetailId = receivedParams.action_id;
    var requestBody = request.body.data;
    var actionInputs = requestBody.actionInputs;

    response.setContentType('application/json');

    if (!sn_nb_action.NextBestActionUtil.isValidString(actionDetailId) || !sn_nb_action.NextBestActionUtil.isValidString(currentRecordTable) || !sn_nb_action.NextBestActionUtil.isValidString(currentRecordSysId))
        response.setError(new sn_ws_err.BadRequestError(gs.getMessage('Missing required parameters')));
    else {
        try {
            var interactionResponse = {};

            var current = new sn_nb_action.NextBestActionUtil.getNextBestActionDAO().getSecureTableRecordBySysId(currentRecordTable,currentRecordSysId);
            if (!current) {
                response.setError(new sn_ws_err.BadRequestError(gs.getMessage('Invalid parameters')));
                return;
            }

            var nbaService = new sn_nb_action.NextBestActionService();
            var actionDetails = nbaService.useAction(current, actionDetailId, actionInputs);
            if (actionDetails) {
                actionDetails.actionDetailId = actionDetailId;
                var responseBody = {};
                responseBody.actionDetails = actionDetails;
                response.setBody(responseBody);
                response.setStatus(200);

            } else {
                var errObj = new sn_ws_err.ServiceError();
                errObj.setStatus(500);
                errObj.setMessage(gs.getMessage('Error starting action'));
                errObj.setDetail(gs.getMessage('Refer error logs for details'));
                response.setError(errObj);
            }
        } catch (err) {
            var customErrObj = new sn_ws_err.ServiceError();
            customErrObj.setStatus(500);
            customErrObj.setMessage(gs.getMessage('Error starting action'));
            customErrObj.setDetail(gs.getMessage('Refer error logs for details'));
            response.setError(customErrObj);
        }

    }

})(request, response);
