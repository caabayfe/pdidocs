function onCondition() {
    if (g_form.getValue('reference_table') !== '') {
        g_form.setDisplay('fields_reference', true);
    }
    g_form.setDisplay('title_type', true);
    if (g_form.getValue('title_type') == 'field') {
        g_form.setDisplay('title', true);
        g_form.setMandatory('title', true);
        g_form.setMandatory('title_custom', false);
        g_form.setDisplay('title_custom', false);
    } else {
        g_form.setDisplay('title_custom', true);
        g_form.setMandatory('title_custom', true);
        g_form.setMandatory('title', false);
        g_form.setDisplay('title', false);
    }
}
