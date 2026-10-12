(function executeRule(current, previous /*null when async*/) {
	if(!current.isNewRecord())
		return;
	var field, value;
	if(current.parent) {
		field =  current.parent.getName();
		value = current.parent + '';
	} else {
		field =  current.guidance.getName();
		value = current.guidance + '';
	}
	
	var snHelpUtil = new SNHelpUtil();
	var nextOrder = snHelpUtil.getNextOrder(field, value, current);
	
	if(!current.guidance)
		current.guidance = current.parent.getRefRecord().getValue("guidance");
	
	current.order = nextOrder;
})(current, previous);
