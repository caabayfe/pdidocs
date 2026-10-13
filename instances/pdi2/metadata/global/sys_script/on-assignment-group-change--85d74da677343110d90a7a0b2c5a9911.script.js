(function executeRule(current, previous /*null when async*/ ) {
    var alertManager = new SNC.AlertManager();
    var currentAssignmentGroupSysId = current.getValue("assignment_group");
    var previousAssignmentGroupSysId = previous.getValue("assignment_group");
    // Check if the assignment group has been deleted
    if (!currentAssignmentGroupSysId) {
        alertManager.updateWorkNotesOnAlert(current, gs.getMessage('Assignment group has been cleared.'));
    } else if (currentAssignmentGroupSysId !== previousAssignmentGroupSysId) {
        // Set work notes indicating the change from the previous assignment group to the current assignment group
        var previousDisplay = previous.getDisplayValue("assignment_group");
        var currentDisplay = current.getDisplayValue("assignment_group");
        if (!previousDisplay && !previousAssignmentGroupSysId)
            alertManager.updateWorkNotesOnAlert(current, gs.getMessage('Assignment group set to "{0}".', currentDisplay));
        else
            alertManager.updateWorkNotesOnAlert(current, gs.getMessage('Assignment group has been changed from "{0}" to "{1}".', [previousDisplay, currentDisplay]));
    }

})(current, previous);
