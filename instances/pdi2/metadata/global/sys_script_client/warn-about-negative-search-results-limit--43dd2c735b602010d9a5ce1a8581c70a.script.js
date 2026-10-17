function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var max = g_scratchpad.max_search_results;
    if (newValue < 0) {
        g_form.showFieldMsg('search_results_limit', getMessage('Limit must be set to a non-negative number'), 'error');
    } else if (max > 0 && newValue > max) {
        g_form.showFieldMsg('search_results_limit', formatMessage(getMessage('Max limit is {0}'), [max]), 'error');
    } else if (oldValue < 0 || oldValue > max) {
        // They changed the negative value to a non-negative one (or) changed the value to under the max limit, so remove the message
        g_form.hideFieldMsg('search_results_limit');
    }
}
