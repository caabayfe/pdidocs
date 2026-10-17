(function executeRule(current, previous /*null when async*/) {

	var helper = new ApplyBoundsSettingsHelper(); 
	helper.applyBoundsOnMetricClassUpdate(current, previous);

})(current, previous);
