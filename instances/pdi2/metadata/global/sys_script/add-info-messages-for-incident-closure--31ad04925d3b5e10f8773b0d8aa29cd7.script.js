(function executeRule(current, previous /*null when async*/ ) {
    // supress message for universal req
    if (!current.universal_request.nil()) return;

    var msg;
    var incNumber = current.getDisplayValue();

    if (current.incident_state.changesTo(IncidentState.RESOLVED)) {
        // don't display message if the incident (current) is child incident and is being resolved by its parent
        if (!gs.nil(current.parent_incident)) {
            // using close_notes to know if the child incident(current) is resolved due to its parent
            var closeNotesPrefix = gs.getMessage('{0} copied from Parent Incident', current.close_notes.getLabel());
            var closeNotes = current.close_notes + "";
            if (closeNotes.indexOf(closeNotesPrefix) == 0) return;
        }

        if (current.child_incidents > 0) {
            msg = gs.getMessage('{0} and its child incident(s) have been resolved', incNumber);
        } else {
            msg = gs.getMessage('{0} has been resolved', incNumber);
        }
    } else if (current.incident_state.changesTo(IncidentState.CLOSED)) {
        msg = gs.getMessage('{0} has been permanently closed', incNumber);
    } else if (current.incident_state.changesTo(IncidentState.CANCELED)) {
        msg = gs.getMessage('{0} has been canceled', incNumber);
    }

    if (msg) gs.addInfoMessage(msg);
})(current, previous);
