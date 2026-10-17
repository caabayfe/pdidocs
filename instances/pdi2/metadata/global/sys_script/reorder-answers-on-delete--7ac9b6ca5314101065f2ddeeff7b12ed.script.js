(function executeRule(current, previous /*null when async*/) {
	var field =  current.question.getName();
	var value = current.question + '';
	var snHelpUtil = new SNHelpUtil();
	snHelpUtil.adjustOrder(field, value, current);
})(current, previous);
