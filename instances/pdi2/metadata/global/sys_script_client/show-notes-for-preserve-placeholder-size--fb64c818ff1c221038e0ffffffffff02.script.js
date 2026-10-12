function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
    getMessage("Note: To avoid layout shift & retain the original placeholder, select the checkbox", function(msgString) {
        g_form.showFieldMsg('preserve_placeholder_size', msgString, 'info');
    });
}
