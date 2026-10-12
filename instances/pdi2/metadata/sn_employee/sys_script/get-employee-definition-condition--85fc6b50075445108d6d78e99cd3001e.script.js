(function executeRule(current, previous /*null when async*/ ) {

    gs.addInfoMessage(gs.getMessage("Employee Profiles can be generated for active users only."));
    g_scratchpad.condition = current.getValue("condition") || "";

})(current, previous);
