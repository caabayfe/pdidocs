(function executeRule(current, previous /*null when async*/) {

	var helper = new ApplyBoundsSettingsHelper(); 
	helper.applyBoundsOnConfigRuleUpdateOrDelete(current, previous);

})(current, previous);
