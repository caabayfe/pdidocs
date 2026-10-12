function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	if (g_form.getValue('type') == 'search_result') {
		$('search_result_annotation').up().show();
		$('genius_result_annotation').up().hide();
	} else {
		$('search_result_annotation').up().hide();
		$('genius_result_annotation').up().show();
	}
	
}
