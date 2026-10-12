(function executeRule(current, previous /*null when async*/) {

	if(current.getValue('global') == 1 && current.getValue('ui_type') != 0) {
		gs.addErrorMessage('Only scripts with UI Type "Desktop" can be marked "Global"');
		current.setAbortAction(true);
	}

})(current, previous);
