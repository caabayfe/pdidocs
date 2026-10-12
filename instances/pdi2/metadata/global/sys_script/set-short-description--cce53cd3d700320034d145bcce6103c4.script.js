(function executeRule(current, previous) {
	function csd(source, operator, target, compare) {
		return target + " " + operator + " " + source + "." + compare;
	}
	
	var prevShortDesc = csd(previous.source_field, previous.operator.getDisplayValue(), previous.target_field, previous.compare);
		
	if (JSUtil.notNil(current.short_description) && current.short_description+"" != prevShortDesc)
		return;

	current.short_description = csd(current.source_field, current.operator.getDisplayValue(), current.target_field, current.compare);
})(current, previous);
