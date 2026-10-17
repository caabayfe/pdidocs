var PADProcessPropertiesService = Class.create();
PADProcessPropertiesService.prototype = {
    initialize: function(opts) {
		this.processDefinitionRepo = (opts && opts.processDefinitionRepo) || new PADProcessDefinitionRepository();
	},
	updateProcess: function(params) {
		var sysId = params['sysId'];
		var processDefGr = this.processDefinitionRepo.get(sysId);
		if (processDefGr.errorType)
			return processDefGr;
		
		if (!processDefGr)
			return {
				errorType: PADConstants.Errors.UPDATE_FAILED,
				message: 'Process definition not found for id: ' + sysId
			};
	
		// Update process definition label and description
		var padUtil = new PADUtilsSI();
		var label = padUtil.getOrDefault(params, 'label', processDefGr.label);
		var description = padUtil.getOrDefault(params, 'description', processDefGr.description);
		var updatedProcessDefGr = this.processDefinitionRepo.update({sysId: sysId, label: label, description: description});
		if (updatedProcessDefGr.errorType)
			return updatedProcessDefGr;
		
		// Update trigger inputs
		var triggerInstanceId = params['triggerInstanceId'];
		var triggerInputs = params['triggerInputs'];
		var triggerInstanceService = new PADTriggerInstanceService();
		var response = triggerInstanceService.updateTriggerInstanceVars({sysId: triggerInstanceId, inputs: triggerInputs});
		if (response.errorType)
			return response;
		
		return {
			label: updatedProcessDefGr.label,
			description: updatedProcessDefGr.description,
			triggerInputs: triggerInputs
		};
	},
    type: 'PADProcessPropertiesService'
};
