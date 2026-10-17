function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		g_form.hideFieldMsg('occurrences');
		g_form.setValue('occurrences', '');
		g_form.setVisible('occurrences', false);
		return;
	}

	g_form.setVisible('occurrences', true);
	setMaxCloneOccurrence();
	getEstimatedCloneEndDate();
}
