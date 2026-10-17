if (!current.active || !current.assigned_to.canWrite())
    gs.addErrorMessage(gs.getMessage('You do not have permission to update assigned to'));
else if (!current.assignment_group.nil() && !gs.getUser().isMemberOf(current.assignment_group.toString()))
    gs.addErrorMessage(gs.getMessage("Assigned to user {0} must be member of Assignment group {1} ", [gs.getUserDisplayName(), current.assignment_group.getDisplayValue()]));
else if (current.assigned_to != gs.getUserID()) {
    current.assigned_to = gs.getUserID();
    current.update();
}
