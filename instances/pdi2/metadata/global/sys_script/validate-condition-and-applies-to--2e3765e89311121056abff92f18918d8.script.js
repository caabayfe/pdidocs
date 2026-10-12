(function executeRule(current, previous /*null when async*/) {
	
	var regex = /^[a-z0-9._]+$/;
	if (current.condition != null && regex.test(current.condition)) {
        var msg = gs.getMessage('Invalid Condition value: {0}', current.condition);
        gs.addErrorMessage(msg);
        current.setAbortAction(true);
	}

	if (current.applies_to != null && regex.test(current.applies_to)) {
        var msg = gs.getMessage('Invalid Applies-To value: {0}', current.applies_to);
        gs.addErrorMessage(msg);
        current.setAbortAction(true);
	}

})(current, previous);
