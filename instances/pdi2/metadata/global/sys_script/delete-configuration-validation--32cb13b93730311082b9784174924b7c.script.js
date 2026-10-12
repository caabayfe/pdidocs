(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord("logger_configuration_validation");
	gr.setLimit(1);
	gr.query("logger_configuration", current.getUniqueValue());

	if (gr.next())
		gr.deleteRecord();
})(current, previous);
