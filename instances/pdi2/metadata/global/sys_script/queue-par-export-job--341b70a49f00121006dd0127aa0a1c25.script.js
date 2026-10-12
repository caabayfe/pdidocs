(function executeRule(current, previous /*null when async*/) {

	gs.eventQueue("par_export_job.async", current,  current.sys_id, current.run_as || gs.getUserID(), "platform_analytics_export");

})(current, previous);
