(function executeRule(current, previous /*null when async*/) {
	var abortAction = false;

	if (!current.canWrite()) {
		gs.addErrorMessage(gs.getMessage('You can only add label to a VTB you own or are a member of'));
		abortAction = true;	
	}

	var grLabel = new GlideRecord('label');
	grLabel.get(current.label);
	if (grLabel.getValue('viewable_by') != 'everyone') {
		gs.addErrorMessage(gs.getMessage('You can only add tags viewable by everyone to a VTB'));
		abortAction = true;
	}

	if (abortAction) current.setAbortAction(true);
})(current, previous);
