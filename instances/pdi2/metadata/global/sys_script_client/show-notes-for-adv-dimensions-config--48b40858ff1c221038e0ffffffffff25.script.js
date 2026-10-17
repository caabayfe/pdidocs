function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	getMessage("Note: Admin can dynamically define the height & width based on Instance option.", function(msgString) {
        g_form.showFieldMsg('advanced_placeholder_dimensions', msgString, 'info');
    });
}
