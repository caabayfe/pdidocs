function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    var widgetType = g_scratchpad.widget_type;
    if (widgetType === 'time' || widgetType === 'score') {
        var ga = new GlideAjax('MultiElementSelectionUtil');
        ga.addParam('sysparm_name', 'isMultiElementSupported');
        ga.addParam('sysparm_config', JSON.stringify({
            "indicator_sysid": g_form.getValue('indicator')
        }));

        ga.getXML(processResponse);
    }
}

function processResponse(response) {
    var answer = response.responseXML.documentElement.getAttribute('answer');
    if (g_form.getValue('indicator') === '')
        answer = 'true';
    g_scratchpad.indicator_supports_aggregate = answer;
    g_form.setValue('elements_filter', g_form.getValue('elements_filter'));
}
