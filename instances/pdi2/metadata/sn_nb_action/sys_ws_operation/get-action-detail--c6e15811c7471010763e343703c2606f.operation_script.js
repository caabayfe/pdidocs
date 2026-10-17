(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {


    var receivedParams = request.pathParams;
    var currentRecordTable = receivedParams.table_name;
    var currentRecordSysId = receivedParams.sys_id;
    var actionDetailId = receivedParams.action_id;

    response.setContentType('application/json');

    if (!sn_nb_action.NextBestActionUtil.isValidString(currentRecordSysId) || !sn_nb_action.NextBestActionUtil.isValidString(currentRecordTable) || !sn_nb_action.NextBestActionUtil.isValidString(actionDetailId))
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
            var actionDetails = nbaService.getActionDetail(current, actionDetailId);

            if (actionDetails) {
                interactionResponse.actionDetails = actionDetails;
                response.setBody(interactionResponse);
                response.setStatus(200);
            } else {
                interactionResponse.actionDetails = {
                    "errorMessage": "This actionDetailId is no longer valid"
                };
                response.setBody(interactionResponse);
                response.setStatus(200);
            }

        } catch (err) {
            var customErrObj = new sn_ws_err.ServiceError();
            customErrObj.setStatus(500);
            customErrObj.setMessage(gs.getMessage('Error fetching action detail'));
            customErrObj.setDetail(gs.getMessage('Refer error logs for details'));
            response.setError(customErrObj);
        }
    }

})(request, response);
