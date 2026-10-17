function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || !g_scratchpad.isGFAInstalled) {
        return;
    }

    (newValue !== "") ? g_form.setMandatory("target_value", true):
        g_form.setMandatory("target_value", false);

}
