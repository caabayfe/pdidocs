(function executeRule(current, previous /*null when async*/) {
	if(!current.isNewRecord())
		return;
	
	var field =  current.question.getName();
	var value = current.question + '';
	
	var snHelpUtil = new SNHelpUtil();
	var nextOrder = snHelpUtil.getNextOrder(field, value, current);
	
	current.order = nextOrder;
})(current, previous);
