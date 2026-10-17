var CommunicationPlanEngine = Class.create();
CommunicationPlanEngine.prototype = Object.extendsObject(CommunicationPlanEngineSNC,{

	initialize: function(sourceRecord, commPlanDefinitionRecord) {
		CommunicationPlanEngineSNC.prototype.initialize.call(this, sourceRecord, commPlanDefinitionRecord);
	},

    type: 'CommunicationPlanEngine'
});
