function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    if (newValue == "IS_START" || newValue == "IS_END" || newValue == "IS_ANYTHING") {
        g_form.setValue("field_display_value", "");
        g_form.setDisplay('field_display_value', false);
        if (newValue != "IS_ANYTHING") {
            g_form.setValue("field", "");
            g_form.setDisplay('field', false);
        }
    } else {
        g_form.setDisplay('field', true);
        g_form.setDisplay('field_display_value', true);
    }
}
