function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var newValueString = newValue.toString();
	updateCleanBase();
	displayCleanBase(newValueString == 'rotate');
}
