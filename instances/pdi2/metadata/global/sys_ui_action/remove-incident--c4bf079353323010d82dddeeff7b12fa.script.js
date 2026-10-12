if (new global.BulkAddIncidents().canRelateIncidents(parent.sys_class_name, current, "problem_id")) {
    current.problem_id = "";
    if (current.update())
        gs.addInfoMessage(gs.getMessage('Incident {0} is removed successfully', [current.getDisplayValue()]));
    else
        gs.addInfoMessage(gs.getMessage('Unable to remove Incident {0}', [current.getDisplayValue()]));
} else {
    gs.addErrorMessage(gs.getMessage("{0} is closed so cannot be removed from this problem.", [current.number]));
}
