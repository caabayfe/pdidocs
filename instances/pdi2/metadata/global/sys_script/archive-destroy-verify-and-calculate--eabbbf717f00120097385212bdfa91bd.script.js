(function executeRule(current, previous /*null when async*/ ) {

    if (current.table.isNil()) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage("The table must be specified"));
    }

    if (current.archive_duration.isNil() && current.active == true && current.api_only == false) {
        current.active = false;
        current.setAbortAction(true);
        gs.addInfoMessage(gs.getMessage("A duration must be specified for a destroy rule to be active"));
    }

    if ((current.archive_duration.changes() || current.condition.changes()) && current.active == true) {
        if (current.archive_duration.changes() && current.condition.changes()) {
            gs.addInfoMessage(gs.getMessage("Destroy rule made inactive because of changes in duration and condition"));
        } else if (current.archive_duration.changes()) {
            gs.addInfoMessage(gs.getMessage("Destroy rule made inactive because of a change in duration"));
        } else {
            gs.addInfoMessage(gs.getMessage("Destroy rule made inactive because of a change in condition"));
        }
        current.active = false;
    }
})(current, previous);
