(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var ScheduledDeploymentErrors = {
        MISSING_PARAMETERS: 'MISSING_PARAMETERS',
        RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
        APPROVAL_UPDATE_FAILED: 'APPROVAL_UPDATE_FAILED'
    };
    try {
        var scheduledDeploymentDateInUTC = request.body.data.scheduledDeploymentDateInUTC;
        var currentRecordSysID = request.pathParams["record_sys_id"];

        // Parameter validation
        if (!currentRecordSysID || !scheduledDeploymentDateInUTC) {
            throw Error(ScheduledDeploymentErrors.MISSING_PARAMETERS);
        }

        var result = ScheduledDeploymentService.updateScheduledDeploymentDate(currentRecordSysID, scheduledDeploymentDateInUTC);
        // Update scheduled deployment date
        if (!result.scheduledDeploymentRecord) {
            throw Error(ScheduledDeploymentErrors.RECORD_NOT_FOUND);
        }

        // Approve deployment request
        var deploymentRequestStateSuccesfullyUpdated = ScheduledDeploymentService.approveDeploymentRequest(currentRecordSysID);
        if (!deploymentRequestStateSuccesfullyUpdated) {
            throw Error(ScheduledDeploymentErrors.APPROVAL_UPDATE_FAILED);
        }

        // Success response
        response.setBody(result);
        response.setStatus(200);
    } catch (exception) {
        gs.error("Scheduled deployment date failed to update with error message " + exception);

        // Handle different error types with appropriate responses
        switch (exception && exception.message) {
            case ScheduledDeploymentErrors.MISSING_PARAMETERS:
                throw new sn_ws_err.ServiceError()
                    .setStatus(400)
                    .setMessage(gs.getMessage("Both scheduled deployment date and deployment request sysID are required"))
                    .setDetail(gs.getMessage("Both scheduled deployment date and deployment request sysID are required"));

            case ScheduledDeploymentErrors.RECORD_NOT_FOUND:
                throw new sn_ws_err.ServiceError()
                    .setStatus(404)
                    .setMessage(gs.getMessage("Scheduled deployment record not found"))
                    .setDetail(gs.getMessage("Scheduled deployment record not found"));

            case ScheduledDeploymentErrors.APPROVAL_UPDATE_FAILED:
                throw new sn_ws_err.ServiceError()
                    .setStatus(500)
                    .setMessage(gs.getMessage("Scheduled deployment approval state was not updated"))
                    .setDetail(gs.getMessage("Scheduled deployment approval state was not updated"));

            default:
                var defaultErrorMessage = gs.getMessage(gs.getMessageLang("Scheduled deployment date failed to update with error message {0}", "en", [exception]));
                var defaultErrorDetail = gs.getMessage(gs.getMessage("Scheduled deployment date failed to update with error message {0}", [exception]));
                throw new sn_ws_err.ServiceError()
                    .setStatus(500)
                    .setMessage(defaultErrorMessage)
                    .setDetail(defaultErrorDetail);
        }
    }

})(request, response);
