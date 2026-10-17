(function executeRule(current, previous /*null when async*/) {
	var inputRecords = new GlideRecord("sys_flow_step_definition_input");
	inputRecords.addQuery("model",current.getUniqueValue());
	inputRecords.addQuery("element","connection");
	inputRecords.query();
	if(!inputRecords.hasNext()){
		inputRecords.setValue("model",current.getUniqueValue());
		inputRecords.setValue("element","connection");
		inputRecords.setValue("label","Connection");
		inputRecords.setValue("default_value","use_connection_alias");
		inputRecords.setValue("choice","3");
		inputRecords.setValue("internal_type","choice");
		// Create input record for connection type
		inputRecords.insert();
		// create choices
		var tableName = inputRecords.getValue("name");
		var choiceTable = new GlideRecord("sys_choice");
		choiceTable.setValue("name", tableName);
		choiceTable.setValue("element", "connection");
		choiceTable.setValue("label", "Define Connection Inline");
		choiceTable.setValue("value", "define_connection_inline");
		choiceTable.insert();
		choiceTable.initialize();
		choiceTable.setValue("name", tableName);
		choiceTable.setValue("element", "connection");
		choiceTable.setValue("label", "Use Connection Alias");
		choiceTable.setValue("value", "use_connection_alias");
		choiceTable.insert();
	}
})(current, previous);
