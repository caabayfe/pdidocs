(function executeRule(current, previous /*null when async*/) {
	var field, value;
	if(current.parent) {
		field =  current.parent.getName();
		value = current.parent + '';
	} else {
		field =  current.guidance.getName();
		value = current.guidance + '';
	}
	var setupUtil = new SNHelpSetupUtil();
	setupUtil.adjustOrder(field, value, current);
})(current, previous);
