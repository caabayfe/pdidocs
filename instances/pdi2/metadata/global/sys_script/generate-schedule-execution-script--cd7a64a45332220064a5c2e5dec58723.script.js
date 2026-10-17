(function executeRule(current, previous /*null when async*/) {

	current.script = "new global.ScheduledTestProcessor().executeScheduledSuites('" + current.sys_id + "');";

	//run the script as the user who created the scheduled test
	current.run_as = gs.getUser().getID();

})(current, previous);
