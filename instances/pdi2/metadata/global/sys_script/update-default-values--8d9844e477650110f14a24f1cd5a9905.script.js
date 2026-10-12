(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	if (gs.nil(current.getValue("prediction_table")))
		current.setValue("prediction_table", "sys_cs_auto_resolution_prediction");
	
	if (gs.nil(current.getValue("use_sla")))
		current.setValue("use_sla", false);
	
	if (gs.nil(current.getValue("iar_invocation")))
		current.setValue("iar_invocation", "business_rule");

})(current, previous);
