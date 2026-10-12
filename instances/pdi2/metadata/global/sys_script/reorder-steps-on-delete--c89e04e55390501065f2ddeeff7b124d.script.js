(function executeRule(current, previous /*null when async*/) {
	var field =  current.guidance.getName();
	var value = current.guidance + '';
	var snHelpUtil = new SNHelpUtil();
	snHelpUtil.adjustOrder(field, value, current);
})(current, previous);
