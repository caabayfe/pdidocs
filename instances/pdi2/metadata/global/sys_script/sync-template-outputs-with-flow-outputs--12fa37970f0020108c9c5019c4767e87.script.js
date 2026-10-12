(function executeRule(current, previous /*null when async*/) {

	var templateAPI = new sn_templates.TemplateScriptableAPI();
	var sysFlowId = templateAPI.syncFlowOutputs(current);
	
	if (sysFlowId !== null)
		current.flow_output_variable = sysFlowId;
})(current, previous);
