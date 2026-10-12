function onCondition() {
    if (g_form.getValue('widget') == 'false') {
        g_form.setDisplay('fields_reference', false);
        g_form.setDisplay('reference_conditions', false);
    }

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
