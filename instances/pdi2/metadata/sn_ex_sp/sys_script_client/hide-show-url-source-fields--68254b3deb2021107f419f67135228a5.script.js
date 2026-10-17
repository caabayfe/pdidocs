function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (newValue == 'page') {
        g_form.setDisplay('internal_link', true);
        g_form.setMandatory('internal_link', true);
        g_form.setMandatory('url', false);
        g_form.setMandatory('url_custom', false);
        g_form.clearValue('url');
        g_form.clearValue('url_custom');
        g_form.setDisplay('url', false);
        g_form.setDisplay('url_custom', false);
    } else if (newValue == 'field') {
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

}
