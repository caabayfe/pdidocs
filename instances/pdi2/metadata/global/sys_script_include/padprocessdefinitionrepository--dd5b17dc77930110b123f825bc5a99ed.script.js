var PADProcessDefinitionRepository = Class.create();
PADProcessDefinitionRepository.prototype = {
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
		
		var gr = new GlideRecord(PADConstants.TABLES.PD_PROCESS_DEFINITION);
		gr.get(sysId);
		return gr;
	},
	update: function(process) {
		var gr = this.get(process.sysId);
		gr.setValue('label', process.label);
		gr.setValue('description', process.description);
		gr.update();
		return {
			label: gr.getValue('label'),
			description: gr.getValue('description')
		};
	},
    type: 'PADProcessDefinitionRepository'
};
