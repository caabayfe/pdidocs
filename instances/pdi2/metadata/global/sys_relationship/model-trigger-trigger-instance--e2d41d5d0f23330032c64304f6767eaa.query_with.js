(function refineQuery(current, parent) {
	var grMetricTriggerSysIds = [];
	var grMetricTrigger = new GlideRecord("sys_flow_metric_trigger");
	grMetricTrigger.addQuery("metric_trigger", parent.getUniqueValue());
	grMetricTrigger.query();
	while (grMetricTrigger.next())
		grMetricTriggerSysIds.push(grMetricTrigger.getUniqueValue());

	var grHubFlowBaseSysIds = [];
	var grHubFlowBase = new GlideRecord("sys_hub_flow_base");
	grHubFlowBase.addQuery("remote_trigger_id", "IN", grMetricTriggerSysIds);
	grHubFlowBase.query();
	while (grHubFlowBase.next())
		grHubFlowBaseSysIds.push(grHubFlowBase.getUniqueValue());
	
	current.addQuery("flow", "IN", grHubFlowBaseSysIds);
	
})(current, parent);
