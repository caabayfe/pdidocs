function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		g_form.hideFieldMsg('occurrences', true);
		return;
	}

	var cloneOccurrences = parseInt(newValue);
	if(cloneOccurrences > g_scratchpad.maxCloneOccurrences) {
		g_form.hideFieldMsg('occurrences', true);
		g_form.showFieldMsg('occurrences', 'Max allowed occurrences restricted to ' + g_scratchpad.maxCloneOccurrences + '.', 'error');
	} else 
		getEstimatedCloneEndDate();

}
