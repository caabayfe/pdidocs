(function executeRule(current, previous /*null when async*/) {

	new AssessmentUtils().wipeMetricSourceFields(current.sys_id);

})(current, previous);
