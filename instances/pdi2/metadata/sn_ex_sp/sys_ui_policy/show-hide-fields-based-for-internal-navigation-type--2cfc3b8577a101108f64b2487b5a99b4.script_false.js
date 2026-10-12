function onCondition() {
    g_form.setMandatory('portal_page', false);
    g_form.setDisplay('portal_page', false);
    g_form.clearValue('portal_page');
    g_form.setDisplay('specify_portal_page', false);
    g_form.setDisplay('field', false);

    g_form.setDisplay('external_navigation_type', true);
    g_form.setMandatory('external_navigation_type', true);
}
