var OperationMetricScripts = Class.create();
OperationMetricScripts.prototype = {
	initialize: function() {
	},
	
	getMIDsWithMetricsCapabilities: function() {
		var gr = new GlideRecord('ecc_agent_capability_m2m');
		gr.addEncodedQuery('capability.capability=Metrics^ORcapability.capability=ALL');
		gr.query();
		var query = '';
		while(gr.next()) {
			query += gr.getValue('agent');
			if(gr.hasNext())
				query += ',';
		}
		return 'sys_idIN' + query;
	},
	
	type: 'OperationMetricScripts'
};
