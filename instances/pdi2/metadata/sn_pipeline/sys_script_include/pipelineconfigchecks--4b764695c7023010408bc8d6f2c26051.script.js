var PipelineConfigChecks = Class.create();
PipelineConfigChecks.prototype = {
	/**
	 * Returns details about the current instance and its controller
	 * Accepts optional pipelineType string
	 * {
		 * instanceId: <instance_id of current instance>
		 * isController: <true if no controller record exists or if one configured is pointing to itself>,
		 * hasValidControllerRecord: <true if controller record present is valid>,
		 * controllerEnvironment: <controller environment details, if existing>,
		 * foundInEnvironmentsInController: <true if current instance is found in environment table in controller>,
		 * hasGivenPipelineTypeConfiguredInController: <true if pipeline is configured with current instance and given pipeline type in controller>,
	 * }
	 * @param {String} pipelineType
	 * @returns {Object}
	 */
	getCurrentInstanceInfo: function(pipelineType) {
		var pipelineUtils = new PipelineUtils();
		var currentInstanceId = gs.getProperty("instance_id");
		var isCurrentInstanceController = pipelineUtils.currentInstanceIsController();
		var controllerData = pipelineUtils.getControllerData();
		var controllerEnv = controllerData.environment;
		var result = {
			instanceId: currentInstanceId,
			isController: isCurrentInstanceController,
			hasValidControllerRecord: false,
			controllerEnvironment: {},
			foundInEnvironmentsInController: false,
			hasGivenPipelineTypeConfiguredInController: false,
		};
		
		if (controllerEnv) {
			var validateControllerOutputs = pipelineUtils.getValidateControllerResponse(
				controllerEnv.getValue('instance_url'),
				controllerEnv.instance_credential.getRefRecord(),
				currentInstanceId,
				pipelineType
			);
			
			var validateControllerResponse = validateControllerOutputs["response_body"] || {};
			var instanceInfo = validateControllerResponse["sourceInstance"] || {};
			
			result.controllerEnvironment = pipelineUtils.getObjectFromGlideRecord(controllerEnv, PipelineConstants.columns.ENVIRONMENT_COLUMNS);
			result.hasValidControllerRecord = validateControllerOutputs["status_code"] === 200 && validateControllerResponse.isValid;
			result.foundInEnvironmentsInController = !!instanceInfo.foundInEnvironments;
			result.hasGivenPipelineTypeConfiguredInController = !!instanceInfo.hasGivenPipelineTypeConfigured;
		}
		
		if (isCurrentInstanceController) {
			var currentInstanceEnv = pipelineUtils.getEnvironmentByInstanceId(currentInstanceId);
			result.foundInEnvironmentsInController = !!currentInstanceEnv.sys_id;
			result.hasGivenPipelineTypeConfiguredInController = pipelineUtils.isSourceInstanceInPipeline(currentInstanceId, pipelineType);
		}
		
		return result;
	},
	
	getControllerRecord: function () {
		return (new PipelineUtils()).getEnvironmentControllerRecord();
	},

    type: 'PipelineConfigChecks'
};
