(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var receivedParams = request.pathParams;
    var currentRecordTable = receivedParams.table_name;
    var currentRecordSysId = receivedParams.sys_id;
    var actionDetailId = receivedParams.action_id;

    response.setContentType('application/json');

    if (!sn_nb_action.NextBestActionUtil.isValidString(actionDetailId) || !sn_nb_action.NextBestActionUtil.isValidString(currentRecordTable) || !sn_nb_action.NextBestActionUtil.isValidString(currentRecordSysId))
        response.setError(new sn_ws_err.BadRequestError(gs.getMessage('Missing required parameters')));
    else {
        try {

            var current = new sn_nb_action.NextBestActionUtil.getNextBestActionDAO().getSecureTableRecordBySysId(currentRecordTable,currentRecordSysId);
            if (!current) {
                response.setError(new sn_ws_err.BadRequestError(gs.getMessage('Invalid parameters')));
                return;
            }

            var nbaService = new sn_nb_action.NextBestActionService();
            var status = 'error';
            status = nbaService.dismissAction(current, actionDetailId);
            if (status && status.actionStatus == sn_nb_action.Constants.STATUS_ERROR) {
                status.actionDetailId = actionDetailId;
                var responseBody = {};
                responseBody.actionDetails = status;
                response.setBody(responseBody);
                response.setStatus(200);
            } else {
                var skipResult = {};
                skipResult.status = status;
                response.setStatus(200);
                response.setBody(skipResult);
            }

        } catch (err) {
            var customErrObj = new sn_ws_err.ServiceError();
            customErrObj.setStatus(500);
            customErrObj.setMessage(gs.getMessage('Error dismissing the action'));
            customErrObj.setDetail(gs.getMessage('Refer error logs for details'));
            response.setError(customErrObj);
        }
    }

})(request, response);
