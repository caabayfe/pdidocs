function onChange(control, oldValue, newValue, isLoading, isTemplate) {	
	var restService = g_form.getDisplayBox('rest_service').value;
	g_form.setValue('rest_service_text', restService);
}
