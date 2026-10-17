(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	var applicationSysId = request.pathParams.application_sys_id;
	var applicationVersion = request.pathParams.application_version;


	var pipelineConfigChecks = new sn_pipeline.PipelineConfigChecks();
	var grController = pipelineConfigChecks.getControllerRecord();

	if(!grController) {
		throw new sn_ws_err.ServiceError()
			.setStatus(500)
			.setMessage(gs.getMessageLang("Controller environment has not been setup.", "en"))
			.setDetail(gs.getMessage("Controller environment has not been setup."));
	}
	
	var prodBaseInstanceUrl = grController.instance_url;
	var prodCredRef = grController.instance_credential.getRefRecord();

	var inputs = {
		application_sys_id: applicationSysId,
		application_version: applicationVersion,
		url: prodBaseInstanceUrl,
		controller_credential: prodCredRef
	};

	var getDeploymentRequestResponse = sn_fd.FlowAPI.executeSubflow('sn_app_eng_studio.get_deployment_request_subflow', inputs);

	if (getDeploymentRequestResponse.has_error) {
		gs.info("Error occurred in sys_ws_operation: Get Deployment Request\n" + getDeploymentRequestResponse.error_message + "\n" + "Deployment Request Record with app_sys_id " + applicationSysId + " and app version " + applicationVersion + " not found.");
		throw new sn_ws_err.ServiceError()
			.setStatus(getDeploymentRequestResponse.status_code || 404)
			.setMessage(gs.getMessageLang("Failed to retrieve Deployment Request Record with app_sys_id {0} and app version {1}.", "en", [applicationSysId, applicationVersion]))
			.setDetail(gs.getMessage("Failed to retrieve Deployment Request Record with app_sys_id {0} and app version {1}.", [applicationSysId, applicationVersion]));
	}

	try {
		var body = JSON.parse(getDeploymentRequestResponse.body);
		var result = body.result || [];
	} catch (e) {
		throw new sn_ws_err.ServiceError()
			.setStatus(404)
			.setMessage(gs.getMessageLang("Error parsing deployment request response", "en"))
			.setDetail(gs.getMessage("Error parsing deployment request response"));
	}
			
	var responseBody = {};

	if (result.length) {
		responseBody = result[0];
		var key = responseBody.state;

		var applicationStatusHelper = new ApplicationStatusHelper();
		responseBody.status = applicationStatusHelper.appStatusMapping[key];
	}

	response.setBody(responseBody);
	response.setStatus(200);
})(request, response);
