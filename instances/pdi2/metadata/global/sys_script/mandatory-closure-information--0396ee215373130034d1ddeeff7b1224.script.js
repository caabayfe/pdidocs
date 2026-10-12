(function executeRule(current, previous /*null when async*/) {
	var abort = false;
	if (current.close_code.nil()) {
		abort = false;
		gs.addErrorMessage(gs.getMessage("Close code is mandatory when closing a Change Request"));
	}

	if (current.close_notes.nil()) {
		abort = true;
		gs.addErrorMessage(gs.getMessage("Close notes are mandatory when closing a Change Request"));
	}

	if (!current.close_code.nil() && !validCloseCode(current.close_code)) {
		abort = true;
		gs.addErrorMessage(gs.getMessage("Close code cannot be set to an invalid value: {0}", current.close_code));
	}
	
	if (abort)
		current.setAbortAction(true);
})(current, previous);

function validCloseCode(closeCode) {
	closeCode = closeCode + "";
	if (!closeCode)
		return true;

	var choices = GlideChoiceList.getChoiceList("change_request", "close_code");
	for (var i = 0; i < choices.getSize(); i++)
		if (choices.getChoice(i).getValue() + "" === closeCode)
			return true;
	return false;
}
