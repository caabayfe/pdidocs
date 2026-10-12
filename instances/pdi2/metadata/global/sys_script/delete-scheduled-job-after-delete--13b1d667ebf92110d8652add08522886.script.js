(function executeRule(current, previous /*null when async*/) {

	global.AutoResolutionSimulationHelper.deleteScheduledJob(current.getValue('scheduled_job'));

})(current, previous);
