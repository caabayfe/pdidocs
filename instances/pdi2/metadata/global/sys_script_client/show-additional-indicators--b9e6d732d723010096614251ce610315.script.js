function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var tag_value = g_form.getValue('tag');
	var compare_value = g_form.getValue('is_compare_chart');
	var show_relative = (newValue == 'time' && g_form.getValue('visualization') == 'relative');
	if ((newValue == 'time' && (compare_value == 'false' || g_form.getValue('visualization') == 'relative')) || (newValue == 'list' && (tag_value.length == 0 || show_relative))) {
		g_form.showRelatedList('REL:2e434d10d7213100757a4251ce610331_list');
	} else {
		g_form.hideRelatedList('REL:2e434d10d7213100757a4251ce610331_list');
	}
	if (newValue == 'process') {
		g_form.showRelatedList('REL:d0044e259f5331005716bb0e832e7058_list');
	} else {
		g_form.hideRelatedList('REL:d0044e259f5331005716bb0e832e7058_list');
	}
	
}
