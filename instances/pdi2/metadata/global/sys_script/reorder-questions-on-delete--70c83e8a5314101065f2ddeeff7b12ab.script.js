(function executeRule(current, previous /*null when async*/) {
	var field =  current.content.getName();
	var value = current.content + '';
	var snHelpUtil = new SNHelpUtil();
	snHelpUtil.adjustOrder(field, value, current);
})(current, previous);
