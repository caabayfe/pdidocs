(function executeRule(current, previous /*null when async*/) {

	// Send execution tracker sys_id with the form (if there is one) so the generation progress can be displayed in the UI
	var trackerGR = new GlideRecord("sys_execution_tracker");
	trackerGR.addQuery("source_table", "sys_atf_performance_compare");
	trackerGR.addQuery("source", current.getUniqueValue());
	trackerGR.query();
	if (trackerGR.next())
		g_scratchpad.executionTrackerID = trackerGR.getUniqueValue();

})(current, previous);
