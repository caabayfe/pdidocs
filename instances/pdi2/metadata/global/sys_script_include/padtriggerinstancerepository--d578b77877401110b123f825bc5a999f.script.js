var PADTriggerInstanceRepository = Class.create();
PADTriggerInstanceRepository.prototype = {
    initialize: function() {
		var padUtils = new PADUtilsSI();
		this.isAuthorizedUser = padUtils.isPADAuthorizedUser();
    },
	get: function(sysId) {
		if (!this.isAuthorizedUser)
			return {
				errorType: PADConstants.Errors.UNAUTHORIZED,
				message: 'You are unauthorized to perform this action.'
			};
		
		if (!sysId)
			return;
		
		var gr = new GlideRecord(PADConstants.TABLES.PD_TRIGGER_INSTANCE);
		gr.get(sysId);
		return gr;
	},
	/**
	* Update Trigger Instance inputs
	*/
	updateTriggerInstanceVars: function(params) {
		var triggerSysId = params.triggerSysId;
		var inputs = params.inputs;
		var triggerInstance = this.get(triggerSysId);
		if (triggerInstance.errorType)
			return triggerInstance;
		
		var triggerInputs = triggerInstance.getElement(PADConstants.Shared.TRIGGER_INPUT);
		
		for (var i=0; i<inputs.length; i++) {
			var inputName = inputs[i].variableName;
			var inputValue = inputs[i].variableValue;
			if (inputName)
				triggerInputs[inputName] = inputValue;
		}
		triggerInputs.update();
		
		/*
		After updating the triggerInputs, force update the trigger instance record
		to trigger its associated business rule for updating the PD.
		DEF0239367: Trigger instance input changes do not get captured for activation
		*/
		triggerInstance.setForceUpdate(true);
		triggerInstance.update();
		return triggerInputs;
	},
    type: 'PADTriggerInstanceRepository'
};
