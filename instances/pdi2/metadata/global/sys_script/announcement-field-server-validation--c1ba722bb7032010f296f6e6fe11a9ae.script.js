function isValidDate(current) {
	var endDate = current.getValue('end');
	if (!endDate)
		return true;

	var startDate = current.getValue('start');
	return endDate > startDate;
}

function isSpecifiedUsers(current) {
	var specificUsers = current.getValue('show_for');
	
	if (specificUsers != "specified_users") 
		return true;

	// admin has defined at least one group or role 
	if (current.getValue('group') || current.getValue('roles')) 
		return true;
	
	//admin has not specified at least one group or role for this announcement
	return false;
}

(function executeRule(current, previous /*null when async*/) {
	var cancelTransaction = false;
	
	if (!isValidDate(current)) {
        cancelTransaction = true;
		gs.addErrorMessage(gs.getMessage('\'Start\' date must be before \'End\' date.'));
    }
	
	if (!isSpecifiedUsers(current)) {
		cancelTransaction = true;
		gs.addErrorMessage(gs.getMessage('Must include at least one role or group.'));
	}
	
	if (cancelTransaction) 
        current.setAbortAction(true);
    
})(current, previous);
