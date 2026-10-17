function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	getMessage("Note: Enabling this feature will load your page faster by delaying load of this specific widget.", function(msgString) {
        g_form.showFieldMsg('async_load', msgString, 'info');
    });
}
