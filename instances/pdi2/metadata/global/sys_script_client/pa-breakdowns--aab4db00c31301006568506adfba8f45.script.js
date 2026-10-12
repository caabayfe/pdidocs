function onChange(control, oldValue, newValue, isLoading) {
	if (newValue == '1') {
		g_form.showRelatedList('pa_breakdown_mappings');
	} else {
		g_form.setMandatory('dimension', false);
		g_form.hideRelatedList('pa_breakdown_mappings');
	}
	g_form.setSectionDisplay('automated', (newValue == '1'));
	g_form.setSectionDisplay('manual', (newValue == '2'));
}
