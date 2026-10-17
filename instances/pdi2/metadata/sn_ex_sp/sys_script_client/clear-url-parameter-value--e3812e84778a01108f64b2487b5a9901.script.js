function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var navigationType = g_form.getValue('navigation_type');
    if (navigationType === "internal") {
        g_form.setDisplay('specify_portal_page', true);
        g_form.setValue('specify_portal_page', 'page_id');
    } else {
        g_form.setDisplay('specify_portal_page', false);
        g_form.setValue('specify_portal_page', 'page_id');
    }
    g_form.clearValue('url_parameters');
    g_form.clearValue('field');

}
