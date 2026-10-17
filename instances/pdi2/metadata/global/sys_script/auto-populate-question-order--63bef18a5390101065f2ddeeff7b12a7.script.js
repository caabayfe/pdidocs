(function executeRule(current, previous /*null when async*/) {
	if(!current.isNewRecord())
		return;
	
	var field =  current.content.getName();
	var value = current.content + '';
	var snHelpUtil = new SNHelpUtil();
	var nextOrder = snHelpUtil.getNextOrder(field, value, current);
	
	current.order = nextOrder;
})(current, previous);
