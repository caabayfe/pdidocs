function onLoad() {

    if (g_form.isNewRecord() || g_form.getValue('follow_element') != "true") {
        g_form.setDisplay("multiple_elements_view", false);
        return;
    }

    var ga = new GlideAjax('MultiElementSelectionUtil');
    ga.addParam('sysparm_name', 'getValueForMultipleElements');
    ga.addParam('sysparm_config', JSON.stringify({
        "indicator_sysid": g_form.getValue('indicator'),
        "widget_type": g_form.getValue('type'),
        "is_previous_period_chart": g_form.getValue('is_compare_chart'),
        "indicator_group": g_form.getValue('tag'),
		"followed_breakdown_relation": g_form.getValue("followed_breakdown_relation")
    }));
    ga.getXML(processResponse);

    function processResponse(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        if (answer) {
            if (answer === 'show_all') {
                g_form.removeOption("multiple_elements_view", ""); // remove none if there
                g_form.setDisplay('multiple_elements_view', true);
                g_form.setReadOnly('multiple_elements_view', false);
            } else if (answer === 'aggregate' || answer === 'separate') {
                g_form.setValue('multiple_elements_view', answer);
                g_form.setReadOnly('multiple_elements_view', true);
                g_form.setDisplay('multiple_elements_view', true);
            } else {
                g_form.removeOption("multiple_elements_view", "");
                g_form.addOption("multiple_elements_view", "", getMessage("Not available"), 0);
                g_form.setValue('multiple_elements_view', "");
                g_form.setReadOnly('multiple_elements_view', true);
                g_form.setDisplay('multiple_elements_view', true);
            }
        }
    }
}
