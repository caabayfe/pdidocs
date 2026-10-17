(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var result = {};
    var currentRecordSysID = request.pathParams["record_sys_id"];

    if (!currentRecordSysID) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage(gs.getMessageLang("Request sysID is required", "en"))
            .setDetail(gs.getMessage("Request sysID is required"));
    }

    try {
        result = ScheduledDeploymentService.cancelDeploymentRequest(currentRecordSysID);
		
    } catch (exception) {
        gs.error("Unable to cancel deployment request. " + exception);

        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage(gs.getMessageLang("Unable to cancel deployment request. {0}", "en", [exception]))
            .setDetail(gs.getMessage("Unable to cancel deployment request. {0}", [exception]));
    }

    if (!result.success) {
        throw new sn_ws_err.ServiceError()
            .setStatus(500)
            .setMessage(gs.getMessageLang("Failed to change state of deployment request to cancelled.", "en"))
            .setDetail(gs.getMessage("Failed to change state of deployment request to cancelled."));
    } else {
        result.updatedRecord = new DeploymentRequestUtils().getDeploymentRequestObject(result.updatedRecord);
    }

    response.setBody(result);
    response.setStatus(200);

})(request, response);
