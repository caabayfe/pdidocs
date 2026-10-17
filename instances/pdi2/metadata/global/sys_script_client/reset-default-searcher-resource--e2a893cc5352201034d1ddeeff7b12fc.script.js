function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	g_form.removeOption("default_searcher_resource","");
	if (isLoading)
		return;
	
	if (newValue === '') // Reset to all
		g_form.setValue("default_Searcher_resource", "all");   
}
