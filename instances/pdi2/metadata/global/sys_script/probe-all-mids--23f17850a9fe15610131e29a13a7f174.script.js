(function() {
	current.state = "processed";
	current.processed = gs.nowDateTime();
	
	var eccRec = new GlideRecord('ecc_queue');
	
	var eccAgentRecords = new GlideRecord('ecc_agent');
	eccAgentRecords.query();
	while (eccAgentRecords.next()) {
		var agent = eccAgentRecords.name;
		eccRec.initialize();
		eccRec.setValue('queue', current.queue);
		eccRec.setValue('priority', current.priority);
		eccRec.setValue('topic', current.topic);
		eccRec.setValue('name', current.name);
		eccRec.setValue('source', current.source);
		eccRec.setValue('payload', current.payload);
		eccRec.setValue('state', 'ready');
		eccRec.setValue('agent', 'mid.server.' + agent);
		eccRec.setValue('agent_correlator', current.agent_correlator);
		eccRec.insert();
	}
})();
