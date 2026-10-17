(function executeRule(current, previous /*null when async*/) {
	if (!current.dependent_on_field)
		return;

	var value = current.dependent_on_field.getValue();
	var firstDot = value.indexOf(".");
	current.dependent_on_field = value.substring(firstDot+1);
	
})(current, previous);
