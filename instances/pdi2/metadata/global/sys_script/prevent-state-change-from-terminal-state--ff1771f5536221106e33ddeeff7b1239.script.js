(function executeRule(current, previous /*null when async*/ ) {
    var userName = gs.getUserName();
    if (userName == "sharedservice.worker") {
        var isValidUpdate = false;
		// As of now we allow tstate change from imed_out to any state other than solution_cancelled
		// Change of state from any other terminal state is not allowed
		// This is necessary for processing last retry attempt solutions created in Utah during upgrde to vancouver
        if (previous.state == "timed_out") {
            if (current.state != "solution_cancelled")
                isValidUpdate = true;
        }

        if (!isValidUpdate) {
			var args = [];
			args.push(previous.state);
			args.push(current.state);
            gs.addErrorMessage(gs.getMessage('Cannot update training state from {0} to {1}.', args));
            current.setAbortAction(true);
        }
    }
})(current, previous);
