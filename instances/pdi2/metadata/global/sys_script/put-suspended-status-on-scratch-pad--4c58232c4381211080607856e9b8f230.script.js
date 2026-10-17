(function executeRule(current, previous /*null when async*/) {
    g_scratchpad.kill_job = current.kill_job;
    g_scratchpad.job_type = current.job_type;
	g_scratchpad.warning_msg = "Your historical mining job has been suspended. No historical data will be collected for new sources or for sources with pending historical mining. Click 'Resume' to collect historical data.";

})(current, previous);
