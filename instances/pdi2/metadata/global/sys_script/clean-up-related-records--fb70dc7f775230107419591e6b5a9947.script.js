(function executeRule(current, previous /*null when async*/) {

	var integrationTable = current.getValue('integration_table');
	var recordId = current.getValue('record_id');
	var gr = new GlideRecord(integrationTable);
	
	if(gr.get(recordId)) {
		gs.eventQueue('ihub_integration_instance.delete.cleanup', gr, integrationTable, recordId);
	}

})(current, previous);
