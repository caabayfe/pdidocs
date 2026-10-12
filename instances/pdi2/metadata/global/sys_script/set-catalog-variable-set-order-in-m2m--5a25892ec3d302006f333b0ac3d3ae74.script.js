(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var variableSetID = current.getValue('variable_set');
	var variableSetGr = new GlideRecord('item_option_new_set');
	if(variableSetGr.get(variableSetID) && variableSetGr.isValidRecord()) {
		current.order = variableSetGr.getValue('order');
		current.setWorkflow(false);
		current.update();
		current.setWorkflow(true);
	}
})(current, previous);
