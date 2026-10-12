function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
	
    if (newValue === 'true') {
        g_form.addInfoMessage(getMessage("Please note, search results displayed and the total search count may vary due to security permissions. Display of these counts can be disabled by deselecting the Show counts for facets check box."));
    }
}
