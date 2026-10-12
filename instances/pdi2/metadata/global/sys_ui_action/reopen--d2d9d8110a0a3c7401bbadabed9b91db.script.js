// Client side onclick function
function reopenIncident() {
    if (g_form.getValue('comments') == '') {
        g_form.setMandatory('comments', true);
    }
    gsftSubmit(null, g_form.getFormElement(), 'reopen_incident'); // MUST call the 'Action name' set in this UI Action
}

// Code that runs without 'onclick'
// Ensure call to server side function with no browser errors
if (typeof window == 'undefined')
    serverReopen();

function serverReopen() {
    // Set Incident state to active, update and reload the record
    current.incident_state = 2;
    current.state = 2;
    current.update();
    var msg;
    if (current.child_incidents > 0) {
        msg = gs.getMessage("{0} and its child incident(s) have been reopened", current.getDisplayValue());
    } else {
        msg = gs.getMessage("{0} has been reopened", current.getDisplayValue());
    }
    gs.addInfoMessage(msg);
    action.setRedirectURL(current);
}
