function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '') {
		return;
	}
	
	var sections = g_form.getSections();
	if (newValue == 'Hostless' || newValue == 'Cloud') {
		g_form.setSectionDisplay('advanced', false);
	} else {
		g_form.setSectionDisplay('advanced', true);
	}
	
	window.showHideRelatedLists(newValue);
}
