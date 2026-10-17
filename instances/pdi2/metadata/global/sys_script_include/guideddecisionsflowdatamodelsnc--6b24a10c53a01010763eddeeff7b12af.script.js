var GuidedDecisionsFlowDataModelSNC = Class.create();
GuidedDecisionsFlowDataModelSNC.prototype = {
    initialize: function() {
		this.FLOW_DATA_TABLE = 'sys_flow_data';
    },
	
	createFlowDataRecord: function(definitionId, state){
		var flowDataGr = new GlideRecord(this.FLOW_DATA_TABLE);
		flowDataGr.initialize();
		flowDataGr.definition = definitionId;
		flowDataGr.state = state;
		flowDataGr.insert();
		return flowDataGr;
	},

    type: 'GuidedDecisionsFlowDataModelSNC'
};
