function clientCheckFields() {
    var e = $("conflict_msg");
    if (e) e.remove();
    var fields = "";
    var i = 0;
    if (g_form.getControl("start_date") && g_form.getValue("start_date") == "") {
        fields += ", " + g_form.getLabelOf("start_date");
        i++;
    }
    if (g_form.getControl("end_date") && g_form.getValue("end_date") == "") {
        fields += ", " + g_form.getLabelOf("end_date");
        i++;
    }
    if (g_form.getControl("cmdb_ci") && g_form.getValue("cmdb_ci") == "") {
        fields += ", " + g_form.getLabelOf("cmdb_ci");
        i++;
    }
    if (i > 1) {
        g_form.addErrorMessage(formatMessage(getMessage("To check conflicts, the following fields need values: {0}"), fields.substring(2)), "conflict_msg");
        return false;
    } else if (i === 1) {
        g_form.clearMessages();
        g_form.addErrorMessage(formatMessage(getMessage("To check conflicts, the following field needs a value: {0}"), fields.substring(2)), "conflict_msg");
        return false;
    }

    gsftSubmit(null, g_form.getFormElement(), 'check_conflicts'); //MUST call the 'Action name' set in this UI Action
}

//Code that runs without 'onclick'
//Ensure call to server-side function with no browser errors
if (typeof window == 'undefined')
    checkConflicts();

function checkConflicts() {

    //Array which stores fields that dont have a value 
    var fieldArray = [];

    //Put Start date label in array if it doesnt have a value
    if (current.start_date.nil())
        fieldArray.push(current.start_date.getLabel());

    //Put End date label in array if it doesnt have a value
    if (current.end_date.nil())
        fieldArray.push(current.end_date.getLabel());

    //Put CMDB CI label in array if it doesnt have a value
    if (current.cmdb_ci.nil())
        fieldArray.push(current.cmdb_ci.getLabel());

    //If there are values stored in the array then print message 
    if (fieldArray.length > 0) {
        var fieldMsg = '';
        for (var i = 0; i < fieldArray.length; i++) {
            fieldMsg += fieldArray[i] + ", ";
        }
        fieldMsg = fieldMsg.substring(0, fieldMsg.length - 2);
        gs.addErrorMessage(gs.getMessage("To check conflicts, the following fields need values: {0}", fieldMsg));
        current.update();
        action.setRedirectURL(current);
        return;
    }
    //else If there are NO values stored in the array execute the action
    else if (fieldArray.length == 0) {
        suppressMaintenanceScheduleMessages = true;
        var conflictDetector = new ChangeCheckConflicts(current);
        var conflictResults = conflictDetector.check();

        current.conflict_status = 'No Conflict';
        var msg;

        if (conflictResults < 0)
            msg = gs.getMessage('Configuration Item needed for conflict analysis');
        else if (conflictResults == 0)
            msg = gs.getMessage('There are <FONT COLOR="green">NO CONFLICTS</FONT>');
        else {
            msg = gs.getMessage('There <FONT COLOR="tomato">ARE CONFLICTS</FONT> - See "Conflicts" related list');
            current.conflict_status = 'Conflict';
        }

        gs.addInfoMessage(msg);
        current.update();
        action.setRedirectURL(current);
    }

}
