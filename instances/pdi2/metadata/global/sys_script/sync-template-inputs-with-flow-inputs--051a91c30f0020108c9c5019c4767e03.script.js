(function executeRule(current, previous /*null when async*/) {

	var templateAPI = new sn_templates.TemplateScriptableAPI();
	var sysFlowId = templateAPI.syncFlowInputs(current);
	
	if (sysFlowId !== null)
		current.flow_input_variable = sysFlowId;

})(current, previous);
