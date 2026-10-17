(function executeRule(current, previous /*null when async*/) {

	var name = current.getValue('name');
	var schedule = current.getValue('schedule');
	var defnId = current.getValue('definition_id');
	var thresh = current.getValue('exec_time_threshold');
	
	if (JSUtil.nil(name)) {
		gs.addErrorMessage(gs.getMessage('Cannot save a count configuration without a name'));
		current.setAbortAction(true);
	} else if (JSUtil.nil(schedule)) {
		gs.addErrorMessage(gs.getMessage('Cannot save a count configuration without a valid schedule'));
		current.setAbortAction(true);
	} else if (JSUtil.nil(defnId)) {
		gs.addErrorMessage(gs.getMessage('Cannot save a count configuration without a valid definition id'));
		current.setAbortAction(true);
	} else if (JSUtil.nil(thresh) || thresh <= 0) {
		gs.addErrorMessage(gs.getMessage('Cannot save a count configuration without a non-zero execution threshold'));
		current.setAbortAction(true);
	}

})(current, previous);
