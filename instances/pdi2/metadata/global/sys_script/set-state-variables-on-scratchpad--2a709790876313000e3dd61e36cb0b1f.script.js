(function executeRule(current, previous /*null when async*/) {

    g_scratchpad.STATE =  new ProblemState().getProblemState();
    g_scratchpad.RESOLUTION_CODES = new ProblemState().getResolutionCodes();

    var moveToClosed = gs.getProperty("problem.acceptrisk.move_to_closed", "true");
    g_scratchpad.PROP_MOVE_TO_CLOSED = moveToClosed;

    g_scratchpad["originalState"] = current.state;
    g_scratchpad["originalResolutionCode"] = current.resolution_code;
    g_scratchpad.FIX_NOTES = current.fix_notes;
    g_scratchpad.WORKAROUND = current.workaround;

})(current, previous);
