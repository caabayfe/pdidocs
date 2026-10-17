(function executeRule(current, previous /*null when async*/) {
	var constants = new SNHelpSetupConstantProvider();
	var status = constants.status;
	
	switch(current.action.toString()) {
		case "skip" :
			current.status = status.SKIPPED;
			break;
		case "closed" :
			current.status = status.ABANDONED;
			break;
		case "completed" :
			current.status = status.COMPLETE;
			break;
		default:
			current.status = status.IN_PROGRESS;
	}
})(current, previous);
