function onCondition() {
    if (g_form.getValue('widget') == 'false') {
        g_form.setMandatory('title', false);
        g_form.setDisplay('title', false);
        g_form.setDisplay('title_custom', true);
        g_form.setMandatory('title_custom', true);
    }
}
