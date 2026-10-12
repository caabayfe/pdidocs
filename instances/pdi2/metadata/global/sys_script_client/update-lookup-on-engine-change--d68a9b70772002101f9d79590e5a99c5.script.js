function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	
	setLookupAndReplacement();
	updateExampleRewrite();
}
