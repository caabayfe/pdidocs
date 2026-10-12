function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var referenceTable = g_form.getValue('reference_table');
    if (newValue === 'true' && referenceTable) {

        var ga = new GlideAjax('TaskConfigurationClientUtil');
        ga.addParam('sysparm_name', 'isNonTaskTable');
        ga.addParam('sysparm_table', referenceTable);
        ga.getXML(isNonTaskTable);

    } else if (newValue === 'false') {
        g_form.clearValue('external');
        g_form.setMandatory('url_source', false);
        g_form.setDisplay('external', false);
        g_form.setDisplay('url_source', false);
        g_form.clearValue('url');
        g_form.clearValue('url_custom');
        g_form.clearValue('internal_link');
        g_form.clearValue('page_parameters');
        g_form.setMandatory('url', false);
        g_form.setMandatory('url_custom', false);
        g_form.setMandatory('internal_link', false);
        g_form.setDisplay('url', false);
        g_form.setDisplay('url_custom', false);
        g_form.setDisplay('internal_link', false);
        g_form.setDisplay('page_parameters', false);
    }

}

function isNonTaskTable(response) {
    var answer = response.responseXML.documentElement.getAttribute("answer");
    if (answer === 'true') {
        g_form.setMandatory('url_source', true);
        g_form.setDisplay('external', true);
        g_form.setDisplay('url_source', true);
        g_form.setDisplay('page_parameters', true);
        if (g_form.getValue('url_source') == 'page') {
            g_form.setDisplay('internal_link', true);
            g_form.setMandatory('internal_link', true);
            g_form.setMandatory('url', false);
            g_form.setMandatory('url_custom', false);
            g_form.clearValue('url');
            g_form.clearValue('url_custom');
            g_form.setDisplay('url', false);
            g_form.setDisplay('url_custom', false);
        } else if (g_form.getValue('url_source') == 'field') {
            g_form.setDisplay('url', true);
            g_form.setMandatory('url', true);
            g_form.setMandatory('internal_link', false);
            g_form.setMandatory('url_custom', false);
            g_form.clearValue('internal_link');
            g_form.clearValue('url_custom');
            g_form.setDisplay('internal_link', false);
            g_form.setDisplay('url_custom', false);
        } else {
            g_form.setDisplay('url_custom', true);
            g_form.setMandatory('url_custom', true);
            g_form.setMandatory('url', false);
            g_form.setMandatory('internal_link', false);
            g_form.clearValue('url');
            g_form.clearValue('internal_link');
            g_form.setDisplay('url', false);
            g_form.setDisplay('internal_link', false);
        }
    } else {
        g_form.clearValue('external');
        g_form.setMandatory('url_source', false);
        g_form.setDisplay('external', false);
        g_form.setDisplay('url_source', false);
        g_form.clearValue('url');
        g_form.clearValue('url_custom');
        g_form.clearValue('internal_link');
        g_form.clearValue('page_parameters');
        g_form.setMandatory('url', false);
        g_form.setMandatory('url_custom', false);
        g_form.setMandatory('internal_link', false);
        g_form.setDisplay('url', false);
        g_form.setDisplay('url_custom', false);
        g_form.setDisplay('internal_link', false);
        g_form.setDisplay('page_parameters', false);
    }
}
