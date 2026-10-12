function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    var typeValue = g_form.getValue('type');
    if (typeValue === 'time' || typeValue === 'score') {
        var indicator = g_form.getValue('indicator');
        var breakdown = g_form.getValue('breakdown');

        var infoMessage = getMessage('The Elements filter applies personalization to the first breakdown of indicators that support the aggregate view. For other indicators, select a filter that returns only one element.');
        var warningMessage = getMessage('The selected indicator does not support the aggregate view. Select an Elements filter that returns only one element.');

        if (indicator === '' || breakdown === '') {
            g_form.hideFieldMsg('elements_filter', true);
            g_form.showFieldMsg('elements_filter', infoMessage, 'info');
        } else {
            g_form.hideFieldMsg('elements_filter', true);
            if (g_scratchpad.elements_filter_aggregate_support === 'false')
                g_form.showFieldMsg('elements_filter', warningMessage, 'warning');

            g_form.showFieldMsg('elements_filter', infoMessage, 'info');
        }
    }

}
