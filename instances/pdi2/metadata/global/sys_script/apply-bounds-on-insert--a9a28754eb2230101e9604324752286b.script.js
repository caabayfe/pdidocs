(function executeRule(current, previous /*null when async*/) {

	var helper = new ApplyBoundsSettingsHelper(); 
	helper.applyBoundsOnConfigSettingsInsert(current, previous);

})(current, previous);
