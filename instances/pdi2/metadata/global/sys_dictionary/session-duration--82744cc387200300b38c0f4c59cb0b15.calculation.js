(function calculatedFieldValue(current) {

	var diffSeconds = gs.dateDiff(current.sys_created_on.getDisplayValue(),
								  current.sys_updated_on.getDisplayValue(), true);
	return diffSeconds;

})(current);
