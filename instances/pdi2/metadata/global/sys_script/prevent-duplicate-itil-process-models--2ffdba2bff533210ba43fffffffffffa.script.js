(function executeRule(current, previous /*null when async*/) {

	const ITIL_CHANGE_PROCESS = "itil_change_process";
	const TABLE_NAME = "table_name";

	// If this BR is executed, the user updating the record will have write access to all models requiring an update
	const modelGr = new GlideRecordSecure(current.getTableName());
	modelGr.addActiveQuery();
	modelGr.addQuery("sys_id","!=", current.getUniqueValue());
	modelGr.addQuery(TABLE_NAME, current.getValue(TABLE_NAME));
	modelGr.addQuery(ITIL_CHANGE_PROCESS, current.getValue(ITIL_CHANGE_PROCESS));
	modelGr.query();

	while(modelGr.next()) {
		modelGr.setValue(ITIL_CHANGE_PROCESS,"");
		modelGr.update();
	}

})(current, previous);
