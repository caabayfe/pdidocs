(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var result = {
		isValid: false,
		instanceId: null,
		sourceInstance: {
			instanceId: null,
			foundInEnvironments: false,
			pipelineTypeName: null,
			hasGivenPipelineTypeConfigured: false,
		}
	};

	try {
		var pipelineUtils = new PipelineUtils();
		var queryParams = request.queryParams;

		var sourceInstanceId = queryParams.source_instance_id && queryParams.source_instance_id[0]; // queryParams values are arrays
		var pipelineTypeName = queryParams.pipeline_type_name && queryParams.pipeline_type_name[0]; // queryParams values are arrays

		result.sourceInstance.instanceId = sourceInstanceId;
		result.sourceInstance.pipelineTypeName = pipelineTypeName;

		var currentInstanceIsController = pipelineUtils.currentInstanceIsController();

		if (currentInstanceIsController) {
			// There are two conditions for being a valid instance
			// Condition 1: There should be no controller defined in the environments table
			// Condition 2: The controller instance defined refers to itself
			result['isValid'] = true;
			result['instanceId'] = gs.getProperty("instance_id");

			if (sourceInstanceId) {
				var sourceInstanceEnvironment = pipelineUtils.getEnvironmentByInstanceId(sourceInstanceId);
				var sourceInstance = {
					instanceId: sourceInstanceId,
					foundInEnvironments: !!sourceInstanceEnvironment.sys_id,
					pipelineTypeName: pipelineTypeName,
					hasGivenPipelineTypeConfigured: pipelineUtils.isSourceInstanceInPipeline(sourceInstanceId, pipelineTypeName)
				};
				result['sourceInstance'] = sourceInstance;
			}
		}
	} catch (exception) {
		throw new sn_ws_err.ServiceError()
			.setStatus(500)
			.setMessage(gs.getMessageLang('Unable to validate controller. {0}', 'en', exception.message))
			.setDetail(gs.getMessage('Unable to validate controller. {0}', exception.message));
	}

	response.setBody(result);
	response.setStatus(200);

})(request, response);
