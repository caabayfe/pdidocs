(function executeRule(current, previous /*null when async*/) {
	// Add your code here
	var dt = current.item_variable.type == 9 ? new GlideDate() : new GlideDateTime();
	dt.setDisplayValue(current.getValue('value'));
	current.setValue('value', dt.getValue());
})(current, previous);
