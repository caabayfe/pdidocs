(function executeRule(current, previous /*null when async*/) {

	g_scratchpad.isNewStateModel = (gs.getProperty("com.snc.iam.new_state_flow", "false") == "true");

})(current, previous);
