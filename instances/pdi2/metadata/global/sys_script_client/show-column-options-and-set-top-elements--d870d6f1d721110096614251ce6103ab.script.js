function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue == 'scorecard')
		g_form.setSectionDisplay('column_settings', true);
	else
		g_form.setSectionDisplay('column_settings', false);
		
	if (isLoading)
        return;
	
	if (newValue == 'scorecard') 
		g_form.setValue('show_top_x', 10);
	else if (newValue == 'treemap')
		g_form.setValue('show_top_x', 200);
	else
	    g_form.setSectionDisplay('column_settings', false);
	
}
