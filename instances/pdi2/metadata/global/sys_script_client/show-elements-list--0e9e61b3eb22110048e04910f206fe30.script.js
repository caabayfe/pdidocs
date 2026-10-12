function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   var allElements = g_form.getValue('all_elements');
	if(allElements=='true' || newValue=='false')
		allElements = newValue;
	
	if (allElements=='false') {
		//show the additional elements list
		g_form.showRelatedList('pa_dimensions_acl_elements');	   
	} else {
		//hide the list
		g_form.hideRelatedList('pa_dimensions_acl_elements');
	}
}
