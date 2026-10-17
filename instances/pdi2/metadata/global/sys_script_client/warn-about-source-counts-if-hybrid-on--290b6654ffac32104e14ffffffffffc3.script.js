function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    if (newValue === 'true') {
        g_form.addInfoMessage(getMessage("Source facet counts are not displayed when hybrid search is enabled, regardless of the 'Show counts for facets' configuration."));
    }
}
