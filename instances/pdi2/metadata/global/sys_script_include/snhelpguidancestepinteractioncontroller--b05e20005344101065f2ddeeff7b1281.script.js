var SNHelpGuidanceStepInteractionController = Class.create();
SNHelpGuidanceStepInteractionController.prototype = {
	initialize: function() {
		this.constants = new SNHelpConstantProvider();
		this.dbController = new SNHelpDBController(this.constants.tables.user_interaction_step);
    },

	createRecord: function(params) {
		return this.dbController.create(params);
	},
	updateRecord: function(sys_id, params) {
		if(!sys_id)
			return;

		return this.dbController.update(sys_id, params);
	},

	getById: function(sys_id) {
		return 	this.dbController.getById(sys_id);
	},

	getByEncodedQuery: function(queryString, orderByField, fields) {
		if(!fields)
			fields = this.constants.restAPIKeys.interactionStep;
		
		return this.dbController.getByEncodedQuery(queryString, orderByField, fields);
	},
	
	getByGuidanceStepId : function(stepId, interactionId) {
		var interactionStep = this.getByEncodedQuery("step=" + stepId + "^user_interaction=" + interactionId, null, this.constants.restAPIKeys.interactionStep);
		
		if(!interactionStep && Array.isArray(interactionStep) && interactionStep.length === 0)
			return null;
		
		return interactionStep[0];
	},
	
	getRelatedInteractionSteps : function(sys_id) {
		return this.getByEncodedQuery("related_user_interaction_step=" + sys_id);
	},
	
    type: 'SNHelpGuidanceStepInteractionController'
};
