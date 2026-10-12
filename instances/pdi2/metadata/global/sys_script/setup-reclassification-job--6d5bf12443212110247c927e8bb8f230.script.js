(function executeRule(current, previous /*null when async*/) {
	var inFiveMinutes = new GlideDateTime();
	inFiveMinutes.addSeconds(300);

	var gr = new ScheduledJobClassifier().createOrUpdateJobToClassifyJobs(inFiveMinutes, true);
})(current, previous);
