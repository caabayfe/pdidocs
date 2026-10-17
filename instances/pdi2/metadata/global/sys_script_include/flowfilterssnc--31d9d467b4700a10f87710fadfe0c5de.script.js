var FlowFiltersSNC = Class.create();
FlowFiltersSNC.prototype = {
    initialize: function() {
    },

	getFlowsByTriggerType: function(triggerType) {
		var flowIds = this._getFlowsByTriggerType('sys_hub_trigger_instance', triggerType);
		return flowIds.concat(this._getFlowsByTriggerType('sys_hub_trigger_instance_v2', triggerType));
	},

	_getFlowsByTriggerType: function(triggerInstanceTable, triggerType) {
		var flowIds = [];
		if (!gs.tableExists(triggerInstanceTable))
			return flowIds;

		var triggerInstanceGr = new GlideRecord(triggerInstanceTable);
		triggerInstanceGr.addQuery("trigger_type", triggerType);
		triggerInstanceGr.addQuery("flow.active", true);
		triggerInstanceGr.addQuery("flow.sys_class_name", "sys_hub_flow");
		triggerInstanceGr.query();

		while (triggerInstanceGr.next()) {
			flowIds.push(triggerInstanceGr.getValue("flow"));
		}
		return flowIds;
	},

    type: 'FlowFiltersSNC'
};
