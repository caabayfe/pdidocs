function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    var widgetType = g_scratchpad.widget_type;
    if (widgetType === 'time' || widgetType === 'score') {
        var indicator = g_form.getValue('indicator');
        var breakdown = g_form.getValue('breakdown');
        if (indicator === '' || breakdown === '') {
            g_form.hideFieldMsg('elements_filter', true);
            g_form.showFieldMsg('elements_filter', g_scratchpad.info_message_widget_indicator, 'info');
        } else {
            g_form.hideFieldMsg('elements_filter', true);
            if (g_scratchpad.indicator_supports_aggregate === 'false')
                g_form.showFieldMsg('elements_filter',  g_scratchpad.warning_message_widget_indicator, 'warning');

            g_form.showFieldMsg('elements_filter', g_scratchpad.info_message_widget_indicator, 'info');
        }
    }

}
