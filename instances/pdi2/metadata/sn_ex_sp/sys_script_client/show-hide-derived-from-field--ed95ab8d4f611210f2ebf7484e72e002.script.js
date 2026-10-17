function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    if (newValue === "field") {
        g_form.setDisplay('field', true);
        g_form.setMandatory('field', true);
        g_form.setMandatory('portal_page', false);
        g_form.setDisplay('portal_page', false);
    } else {
        g_form.setMandatory('field', false);
        g_form.setDisplay('field', false);
        g_form.setMandatory('portal_page', true);
        g_form.setDisplay('portal_page', true);
    }
}
