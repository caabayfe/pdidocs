function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '') {
       return;
    }

	if (newValue == 'true') {
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
