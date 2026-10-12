function onChange(control, oldValue, newValue, isLoading, isTemplate) {	
	var enableRelatedSearchBox = g_form.getBooleanValue('related_search_active');
	g_form.setVisible('enable_source_selector', enableRelatedSearchBox);
}
