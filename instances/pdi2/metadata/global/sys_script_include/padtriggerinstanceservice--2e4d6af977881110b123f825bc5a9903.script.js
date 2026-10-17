var PADTriggerInstanceService = Class.create();
PADTriggerInstanceService.prototype = {
    initialize: function(opts) {
		this.triggerInstanceRepo = (opts && opts.triggerInstanceRepo) || new PADTriggerInstanceRepository();
    },
	updateTriggerInstanceVars: function(params) {
		var sysId = params.sysId;
		var inputs = params.inputs;
		
		var triggerInstance = this.triggerInstanceRepo.get(sysId);
		if (triggerInstance.errorType)
			return triggerInstance;
		
		if (triggerInstance) {
			var triggerInputs = triggerInstance.getElement(PADConstants.Shared.TRIGGER_INPUT);
			var glideVarUtil = new PADGlideVarUtilSI();
			var mandatoryAttrs = glideVarUtil.getMandatoryAttributes(triggerInputs);
			var invalidInputs = [];
			for (var i=0; i<inputs.length; i++) {
				var inputName = inputs[i].variableName;
				var inputValue = inputs[i].variableValue;
				if (mandatoryAttrs[inputName] && JSUtil.nil(inputValue))
					invalidInputs.push(inputs[i]);
			}
			if (invalidInputs.length >0)
				return {
					errorType: PADConstants.Errors.UPDATE_FAILED,
					message: 'Could not save trigger instance because mandatory inputs are empty'
				};
			else
				return this.triggerInstanceRepo.updateTriggerInstanceVars({triggerSysId: sysId, inputs: inputs});
		} else {
			return {
				errorType: PADConstants.Errors.UPDATE_FAILED,
				message: 'Trigger not found for id: ' + sysId
			};
		}
	},
    type: 'PADTriggerInstanceService'
};
