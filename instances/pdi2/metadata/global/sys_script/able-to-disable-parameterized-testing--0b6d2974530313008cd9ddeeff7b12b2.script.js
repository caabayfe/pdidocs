(function executeRule(current, previous /*null when async*/) {
	var hasParameters = current.parameters.hasVariables();

	var gr = new GlideRecord('sys_atf_parameter_set');
	gr.addQuery('test', current.sys_id);
	gr.query();
	var hasParameterSets = gr.hasNext();

	if (hasParameterSets || hasParameters) {
		current.setAbortAction(true);
		gs.addErrorMessage("You must delete all parameters and parameter sets before disabling parameterized testing");
	}

})(current, previous);
