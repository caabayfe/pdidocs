function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    var manualElements = g_form.getValue('manual_elements');
	
	if (newValue == 'breakdown' && manualElements == 'true') {
		//hide the elements_filter
		g_form.setDisplay('elements_filter', false);
		
		//show the additional elements list
		g_form.showRelatedList('pa_widget_elements');	   
	} else {
		//show the elements_filter
		g_form.setDisplay('elements_filter', true);
		//hide the list
		g_form.hideRelatedList('pa_widget_elements');
	}
}
