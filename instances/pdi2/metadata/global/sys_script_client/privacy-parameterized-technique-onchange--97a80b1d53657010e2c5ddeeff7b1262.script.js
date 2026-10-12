function onChange (control , oldValue , newValue , isLoading ) {
	if (isLoading || newValue === '')
		return;
	populateParameterValues(g_form.getUniqueValue(), newValue);
	g_form.save();
}
