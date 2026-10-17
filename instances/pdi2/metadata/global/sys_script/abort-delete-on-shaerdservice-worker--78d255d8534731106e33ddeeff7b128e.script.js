(function executeRule(current, previous /*null when async*/ ) {
    if (current.operation() == "update") {
        if (previous.active == true && current.active == false) {
            gs.addErrorMessage(gs.getMessage('Cannot deactivate sharedservice worker user.'));
            current.setAbortAction(true);
        }
		// check if user is trying to change user id
		if (previous.user_name != current.user_name && current.user_name != "sharedservice.worker") {
			gs.addErrorMessage(gs.getMessage('Cannot modify User ID of sharedservice worker user.'));
            current.setAbortAction(true);
		}
    } else { // operation is delete
        gs.addErrorMessage(gs.getMessage('Cannot delete sharedservice worker user.'));
        current.setAbortAction(true);
    }

})(current, previous);
