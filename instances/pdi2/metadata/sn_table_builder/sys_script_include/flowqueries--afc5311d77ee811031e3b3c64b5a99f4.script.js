var FlowQueries = Class.create();

// Get triggers of given type
(FlowQueries.getTriggersOfType = function (triggerTypes) {
	var triggers = new GlideRecord('sys_hub_trigger_instance');
	triggers.addQuery('trigger_type', 'IN', triggerTypes);
	triggers.addQuery('flow.sys_class_name', 'sys_hub_flow');
	triggers.query();
	return triggers;
}),
	// Gets all flows
	(FlowQueries.getFlowDataOfTable = function (sysIds, query) {
		var flows = new GlideRecord('sys_hub_flow');
		if (query) flows.addEncodedQuery(query, true);
		flows.addQuery('sys_id', 'IN', sysIds);
		flows.query();
		return flows;
	});

FlowQueries.prototype = {
	initialize() {},

	type: 'FlowQueries',
};
