function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	g_form.setDisplay("job", newValue=="scheduled");
}
