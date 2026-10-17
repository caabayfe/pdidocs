(function() {
	var assignedToFieldLabel = sys_meta[current.getRecordClassName()]["assigned_to"].label;

	if (!current.assigned_to.canWrite()) {
		gs.addErrorMessage(gs.getMessage("You do not have permission to update the {0} field", [assignedToFieldLabel]));
		return;
	}

	if (!current.assignment_group.nil() && !gs.getUser().isMemberOf(current.assignment_group.toString())) {
		gs.addErrorMessage(gs.getMessage("{0} user must be a member of the \"{1}\" group ", [assignedToFieldLabel, current.assignment_group.getDisplayValue()]));
		return;
	}

	current.assigned_to = gs.getUserID();
	current.update();
})();
