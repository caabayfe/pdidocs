(function executeRule(current, previous /*null when async*/) {
	var atfPrivateParam = new GlideRecord('sys_atf_parameter_variable');
	atfPrivateParam.addQuery('element', current.element);
	atfPrivateParam.query();
	
	if (atfPrivateParam.hasNext()) {
		var error = gs.getMessage("The column name {0} is already in use as an exclusive parameter name. Please use a different column name for this parameter.", [current.element]);
		gs.addErrorMessage(error);
		current.setAbortAction(true);
	}

})(current, previous);
