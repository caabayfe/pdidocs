(function executeRule(current, previous /*undefined when async or display*/) {
	var RUNNING = "1";
	var trackerGr = new GlideRecord("sys_execution_tracker");
	trackerGr.addQuery("source", current.getUniqueValue());
	trackerGr.addQuery("name", ChangeCheckConflicts.TRACKER_NAME);
	trackerGr.addQuery("state", RUNNING);
	trackerGr.query();
	
	var MESSAGE = gs.getMessage("The conflict check has been cancelled because the change request it was being run against has been modified");	
	if (trackerGr.next())
		SNC.GlideExecutionTracker.getBySysID(trackerGr.getUniqueValue()).cancel(MESSAGE);

})(current, typeof previous != 'undefined' ?  previous : null);
