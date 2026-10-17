function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '')
		return;

	// The dependent field search_field needs to be cleared when we change this reference field
	g_form.setValue("search_variable", "", "");
   
}
