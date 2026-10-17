function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	
	var placeholder = "${param}";
	var questionLabel = g_form.getValue('question');
	if (questionLabel.indexOf(placeholder) > -1)
		return;
	g_form.setValue('question', questionLabel + " " + placeholder);
}
