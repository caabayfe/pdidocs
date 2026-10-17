function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
	
	g_form.handleEsLatestVisibilty(newValue === 'true' ? 'false' : 'true');
}
