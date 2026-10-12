function onCondition() {
    if (g_form.getValue('widget') == 'false') {
        g_form.setMandatory('title_custom', false);
        g_form.setDisplay('title_custom', false);
        g_form.setDisplay('title', true);
        g_form.setMandatory('title', true);
    }
}
