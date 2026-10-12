(function executeRule(current, previous /*null when async*/) {
	if (!current.close_code.nil() && !validCloseCode(current.close_code)) {
		gs.addErrorMessage(gs.getMessage("Close code cannot be set to an invalid value: {0}", current.close_code));
		// Abort the modification
		current.setAbortAction(true);
	}
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
