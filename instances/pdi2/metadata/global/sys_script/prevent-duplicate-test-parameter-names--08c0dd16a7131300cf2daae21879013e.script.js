(function executeRule(current, previous /*null when async*/) {
	var atfParam = new GlideRecord('sys_atf_parameter_set');
	
	if (atfParam.getElement(current.element) != null) {
		var error = gs.getMessage("The column name {0} is already in use as a shared parameter name. Please use a different column name for this variable.", [current.element]);
		gs.addErrorMessage(error);
		current.setAbortAction(true);
	}

})(current, previous);
