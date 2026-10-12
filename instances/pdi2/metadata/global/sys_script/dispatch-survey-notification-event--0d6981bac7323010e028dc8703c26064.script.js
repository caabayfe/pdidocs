(function executeRule(current, previous /*null when async*/) {
	var url = new AssessmentUtils().getAssessmentInstanceURL(current.sys_id);
	gs.eventQueue("record.send_survey", current, current.user, url);

})(current, previous);
