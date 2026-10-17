(function executeRule(current, previous /*null when async*/) {
	var params = current.parameter_class_attribute_name + '';
	var paramsArr = params.split(',');
	if (paramsArr.length > 1) {
		gs.addErrorMessage(gs.getMessage('Cannot have multiple parameters defined for a product instance parameter identifier.'));
		current.setAbortAction(true);
	}
})(current, previous);
