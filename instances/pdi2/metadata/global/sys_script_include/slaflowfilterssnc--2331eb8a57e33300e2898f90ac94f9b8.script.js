var SLAFlowFiltersSNC = Class.create();
SLAFlowFiltersSNC.prototype = {
	initialize: function() {
	},

	getSLATaskFlows: function() {
		var flows = new global.FlowFiltersSNC().getFlowsByTriggerType("sla_task");
		return "sys_idIN" + flows.join(",");
	},

    type: 'SLAFlowFiltersSNC'
};
