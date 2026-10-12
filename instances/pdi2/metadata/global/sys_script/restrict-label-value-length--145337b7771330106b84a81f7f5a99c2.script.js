(function executeRule(current, previous /*null when async*/) {

	if (current.value != undefined && current.value.toString().length > 255) {
		gs.addErrorMessage(gs.getMessage("Value length exceeds 255 characters."));
		current.setAbortAction(true);
		return false;
	}
	if (current.label != undefined && current.label.toString().length > 255) {
		gs.addErrorMessage(gs.getMessage("Label length exceeds 255 characters."));
		current.setAbortAction(true);
		return false;
	}

})(current, previous);
