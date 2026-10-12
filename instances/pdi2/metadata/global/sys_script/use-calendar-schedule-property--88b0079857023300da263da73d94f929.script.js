(function executeRule(current, previous /*null when async*/ ) {

    g_scratchpad.useSchedules = gs.getProperty("com.snc.inactivity.monitor.use.schedule", "false") === "true";

})(current, previous);
