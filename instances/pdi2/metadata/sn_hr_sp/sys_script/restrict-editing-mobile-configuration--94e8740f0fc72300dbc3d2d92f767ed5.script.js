(function executeRule(current, previous /*null when async*/) {
	if (current.operation() == 'insert')
		gs.addErrorMessage(gs.getMessage('The mobile configurations cannot be created.'));
	else if (current.operation() == 'update')
		gs.addErrorMessage(gs.getMessage('The mobile configurations cannot be updated.'));
	else if (current.operation() == 'delete')
		gs.addErrorMessage(gs.getMessage('The mobile configurations cannot be deleted.'));
	current.setAbortAction(true);
})(current, previous);
