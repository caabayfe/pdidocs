(function() {
	if (pm.isZboot()) {
		var defaultSLAFlow = "Default SLA Flow";

		var sysDictionaryGr = new GlideRecord('sys_dictionary');
		sysDictionaryGr.addQuery('name', 'contract_sla');
		sysDictionaryGr.addQuery('element', 'flow');
		sysDictionaryGr.query();

		if (!sysDictionaryGr.next())
			return;

		var sysHubFlowGr = new GlideRecord("sys_hub_flow");
		sysHubFlowGr.addQuery("name", defaultSLAFlow);
		sysHubFlowGr.query();
		
		if (!sysHubFlowGr.next())
			return;
		
		sysDictionaryGr.setValue("default_value", defaultSLAFlow);
		sysDictionaryGr.update();
	}
})();
