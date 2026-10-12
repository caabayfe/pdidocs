revertToNew(current);
action.setRedirectURL(current);

function revertToNew(changeRequestGr) {
	var changeRequest = new ChangeRequest(changeRequestGr);
	if (!changeRequest.revertToNew())
		gs.addErrorMessage(gs.getMessage('State Model for {0} changes does not allow reverting change from {1} state', [changeRequest.getValue('type'), changeRequest.getDisplayValue('state')]));
}
