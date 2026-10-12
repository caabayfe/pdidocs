(function executeRule(current, previous /*null when async*/) {
	var scheduleTrackerId = sn_atf.ATFSchedule.getNewestRunningTrackerSysIdForSchedule(current.sys_id);
	if (scheduleTrackerId) {
	  var linkOpenTag = "<a onclick='showScheduledSuiteProgress()' tabindex='0'>";
	  var linkCloseTag = "</a>";
	  var message = "This schedule is currently running. {0}View suite execution progress{1}.";
	  gs.addInfoMessageNoSanitization(gs.getMessage(message, [linkOpenTag, linkCloseTag]), "scheduleInProgressClickHereLink");
	}
})(current, previous);
