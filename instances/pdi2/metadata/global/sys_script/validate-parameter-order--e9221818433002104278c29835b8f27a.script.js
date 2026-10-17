(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('product_instance_identifier_parameters');
	gr.addQuery('pid_configuration', current.pid_configuration);
	gr.addQuery('parameter_class_name', current.parameter_class_name);
	gr.addQuery('sys_id', '!=', current.sys_id);
	gr.addQuery('parameter_order', current.parameter_order);
	gr.query();

	if (gr.getRowCount() > 0) {
		gs.addErrorMessage(gs.getMessage('Cannot have same parameter order for multiple parameters.'));
		current.setAbortAction(true);
	}
})(current, previous);
