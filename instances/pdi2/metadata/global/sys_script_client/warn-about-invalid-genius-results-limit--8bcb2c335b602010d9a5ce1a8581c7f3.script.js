function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    var MAX_GENIUS_RESULTS = 10;
    if (isLoading || newValue === '') {
        return;
    }
    if (newValue < 0) {
        // Change from valid value to a negative one
        g_form.showFieldMsg('genius_results_limit', getMessage('Limit must be set to a non-negative number'), 'error');
    } else if (newValue > MAX_GENIUS_RESULTS) {
        // Changed value to one that's above the max allowed number of genius results
        g_form.showFieldMsg('genius_results_limit', getMessage('Limit must be 10 or less'), 'error');
    } else {
        // Changed value to a non-negative value that doesn't exceed max allowed genius results
        g_form.hideFieldMsg('genius_results_limit');
    }
}
