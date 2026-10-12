function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (!isLoading && newValue !='') {
		control.validator.check(oldValue, newValue);
	}
}
