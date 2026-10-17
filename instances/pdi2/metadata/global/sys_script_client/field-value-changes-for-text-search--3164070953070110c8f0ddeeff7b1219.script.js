function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue === '') {
        return;
    }
    if (newValue == 'STARTS_WITH' || newValue == "ENDS_WITH" || newValue == "LIKE" || newValue == "NOT_LIKE") {
        g_form.setReadOnly("field_display_value", false);
        jQuery("#select_finding_rule_value").hide();
    } else {
        g_form.setReadOnly("field_display_value", true);
        jQuery("#select_finding_rule_value").show();
    }
    if (!isLoading) {
        g_form.setValue("field_display_value", "");
        g_form.setValue("field_value", "");
    }
}
