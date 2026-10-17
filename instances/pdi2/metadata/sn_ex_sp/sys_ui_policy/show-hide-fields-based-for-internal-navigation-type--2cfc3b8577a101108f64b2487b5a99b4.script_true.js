function onCondition() {
    var isDerivedValue = g_form.getValue('specify_portal_page');
    if (isDerivedValue === "field") {
        g_form.setDisplay('field', true);
        g_form.setMandatory('field', true);
        g_form.setMandatory('portal_page', false);
        g_form.setDisplay('portal_page', false);
    } else {
        g_form.setDisplay('field', false);
        g_form.setMandatory('field', false);
        g_form.setMandatory('portal_page', true);
        g_form.setDisplay('portal_page', true);
    }

    g_form.setMandatory('external_navigation_type', false);
    g_form.setDisplay('external_navigation_type', false);
    g_form.clearValue('external_navigation_type');
}
