(function executeRule(current, previous /*null when async*/ ) {
    var input = current.inputs;
    var branches = JSON.parse(input.branches);
    if (branches.length < 2) {
        gs.addErrorMessage(gs.getMessage("Decision must have at least 2 branches."));
        current.setAbortAction(true);
        return;
    }
    var isElsePresent = false;
	var idealPathCount = 0;
    var branchesChanged = false;
    for (var i = 0; i < branches.length; i++) {
        var branch = branches[i];
        var label = branch.label;
        if (!label) {
            gs.addErrorMessage(gs.getmessage("All branches must have a label."));
            current.setAbortAction(true);
            return;
        }
        if (branch.id === 'ELSE') {
            if (branch.condition) {
                gs.addErrorMessage(gs.getMessage("Else branch cannot have condition to run."));
                current.setAbortAction(true);
                return;
            }
            isElsePresent = true;
        }
		if (branch.isIdealPath && typeof branch.isIdealPath !== 'boolean') {
            gs.addErrorMessage(gs.getmessage("Ideal path must be a boolean."));
            current.setAbortAction(true);
            return;
        }
        if (branch.isIdealPath) {
            idealPathCount++;
        }
    }
    if (!isElsePresent) {
        gs.addErrorMessage(gs.getMessage("Decision must have an else branch."));
        current.setAbortAction(true);
        return;
    }
	if (input.type == 'match_first' && idealPathCount > 1) {
        gs.addErrorMessage(gs.getMessage("Only one branch can be marked as the ideal path when the decision type is Match First."));
        current.setAbortAction(true);
        return;
    }
    if (branchesChanged) {
        input.branches = JSON.stringify(branches);
    }
})(current, previous);
