(function executeRule(current, previous /*null when async*/) {
	var tableName = 'sa_hash';
	var fieldName = 'metrics_config_trigger';
	gs.log("Attempting to delete " + fieldName + " entry in table '" + tableName + "'");
	var gr = new GlideRecord(tableName);
	gr.addQuery('name', fieldName);
	gr.query();
	if (gr.next()) {
		gs.log(fieldName + " found in " + tableName +" and trying to delete");
		gr.deleteRecord();
		gs.log(fieldName + " deleted from  " + tableName);
	}

})(current, previous);
