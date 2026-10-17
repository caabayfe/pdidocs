(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appId = request.pathParams["app_id"];

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
		
		try {
			var actionOutputs = deploymentRequestUtils.getOpenDeploymentRequestPresentForAppFromEnv(appId, controllerEnv);
			var status = actionOutputs["status_code"];
            var responseFromController = actionOutputs.response_body ? JSON.parse(actionOutputs.response_body) : {};
        } catch (e) {
            gs.debug("Fetching open deployment request from controller failed with error: " + JSON.stringify(e));
            throw new sn_ws_err.ServiceError()
                .setStatus(500)
                .setMessage(gs.getMessageLang("Error fetching deployment information", "en"))
                .setDetail(gs.getMessage("Error fetching deployment information from controller instance: ", JSON.stringify(e)));
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
		var openDeploymentRequest = deploymentRequestUtils.getDeploymentRequestObject(openDeploymentRequestRecord);
		
        response.setBody(openDeploymentRequest);
        response.setStatus(200);
    }

})(request, response);
