(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appId = request.pathParams["app_id"];
    var payload = request.body.data;

    var pipelineConfigChecks = new sn_pipeline.PipelineConfigChecks();
    var deploymentRequestUtils = new DeploymentRequestUtils();

    var currentInstanceInfo = pipelineConfigChecks.getCurrentInstanceInfo();

    if (!currentInstanceInfo.isController) {
        if (!currentInstanceInfo.hasValidControllerRecord) {
            throw new sn_ws_err.ServiceError()
                .setStatus(404)
                .setMessage(gs.getMessageLang("Controller environment not found", "en"))
                .setDetail(gs.getMessage("Controller environment configured is not valid"));
        }

        var controllerEnv = pipelineConfigChecks.getControllerRecord();

        deploymentRequestUtils.checkCanUpdateDeploymentRequestOnController(appId, controllerEnv);

        try {
            var actionOutputs = deploymentRequestUtils.updateOpenDeploymentRequestPresentForAppOnEnv(appId, controllerEnv, payload);
            var status = actionOutputs["status_code"];
            var responseFromController = actionOutputs.response_body ? JSON.parse(actionOutputs.response_body) : {};
        } catch (e) {
            gs.debug("Fetching open deployment request from controller failed with error: " + JSON.stringify(e));
            throw new sn_ws_err.ServiceError()
                .setStatus(500)
                .setMessage(gs.getMessageLang("Error updating deployment information", "en"))
                .setDetail(gs.getMessage("Error updating deployment information on controller instance: ", JSON.stringify(e)));
        }

        if (status === 200) {
            var parsedResult = responseFromController.result || {};
            response.setStatus(200);
            response.setBody(parsedResult);
            return;
        } else {
            var parsedError = responseFromController.error || {};
            throw new sn_ws_err.ServiceError()
                .setStatus(status)
                .setMessage(parsedError.message)
                .setDetail(gs.getMessage("Redirected response from controller instance: {0}", parsedError.detail));
        }

    } else {
        var openDeploymentRequestRecord = deploymentRequestUtils.getOpenDeploymentRequestRecordForApp(appId);

        if (!openDeploymentRequestRecord || !openDeploymentRequestRecord.isValidRecord()) {
            throw new sn_ws_err.ServiceError()
                .setStatus(404)
                .setMessage(gs.getMessageLang("Open deployment request not found.", "en"))
                .setDetail(gs.getMessage("There is no open deployment request for app id {0}.", appId));
        }

        if (payload && payload.state && payload.state === DeploymentPipelineConstants.deploymentRequest.states.CANCELED) {
            try {
                result = ScheduledDeploymentService.cancelDeploymentRequest(openDeploymentRequestRecord.sys_id);
            } catch (exception) {
                if (exception instanceof sn_ws_err.ServiceError) {
                    throw exception;
                } else {
                    gs.error("Unable to cancel deployment request. " + exception);
                    throw new sn_ws_err.ServiceError()
                        .setStatus(500)
                        .setMessage(gs.getMessageLang("Unable to cancel deployment request. {0}", "en", [exception]))
                        .setDetail(gs.getMessage("Unable to cancel deployment request. {0}", [exception]));
                }
            }

            if (!result.success) {
                throw new sn_ws_err.ServiceError()
                    .setStatus(500)
                    .setMessage(gs.getMessageLang("Failed to change state of deployment request to cancelled.", "en"))
                    .setDetail(gs.getMessage("Updating the state of deployment request ended in error: {0}", openDeploymentRequestRecord.getLastErrorMessage()));
            }
            openDeploymentRequestRecord = result.updatedRecord;
        } else {
            throw new sn_ws_err.ServiceError()
                .setStatus(400)
                .setMessage(gs.getMessageLang("Unsupported update properties.", "en"))
                .setDetail(gs.getMessage("The state of the deployment request can only be updated to canceled."));
        }

        var updatedDeploymentRequest = deploymentRequestUtils.getDeploymentRequestObject(openDeploymentRequestRecord);

        response.setBody(updatedDeploymentRequest);
        response.setStatus(200);
    }

})(request, response);
