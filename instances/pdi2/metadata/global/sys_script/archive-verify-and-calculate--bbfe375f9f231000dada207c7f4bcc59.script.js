if (current.table.isNil()) {
    current.setAbortAction(true);
    gs.addErrorMessage(gs.getMessage("Table must be specified"));
}

if (current.condition.isNil() && current.active == true && current.api_only == false) {
    current.active = false;
    current.setAbortAction(true);
    gs.addInfoMessage(gs.getMessage("A condition must be specified for a rule to be active"));
}

if (current.condition.changes() && current.active == true) {
    current.active = false;
    gs.addInfoMessage(gs.getMessage("Rule has been made inactive because of a change in conditions"));
}

var as = new GlideArchiveStatus(current.sys_id);

if (current.active.changes() && !current.api_only) {
    current.next_run_date = (current.active == true? as.getNextRunDate() : "");
}
