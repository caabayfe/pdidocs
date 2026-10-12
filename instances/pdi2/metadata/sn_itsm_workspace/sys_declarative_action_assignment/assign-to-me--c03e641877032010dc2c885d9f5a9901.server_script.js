assignToMe();

function assignToMe() {
    if (!current.active || !current.assigned_to.canWrite()) {
        gs.addErrorMessage(gs.getMessage('You do not have permission to update assigned to'));
        return;
    } else if (!current.assignment_group.nil() && !gs.getUser().isMemberOf(current.assignment_group.toString())) {
        gs.addErrorMessage(gs.getMessage("Assigned to user {0} must be member of Assignment group {1}", [gs.getUserDisplayName(), current.assignment_group.getDisplayValue()]));
        return;
    } else if (current.assignment_group.nil()) {
        var memberGroups = new global.IncidentUtils().getMemberGroups(gs.getUserID(), 2);
        if (memberGroups.length > 1) {
            gs.addErrorMessage(gs.getMessage("Assigned to user {0} is member of multiple groups, please select one as Assignment group", [gs.getUserDisplayName()]));
            return;
        } else if (memberGroups.length == 1)
            current.assignment_group = memberGroups[0];
    }
    current.assigned_to = gs.getUserID();
    current.update();
}
