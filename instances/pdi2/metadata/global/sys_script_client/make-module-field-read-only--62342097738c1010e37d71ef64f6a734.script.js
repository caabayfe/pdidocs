function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (g_form.getValue("module")) {
        g_form.setReadOnly("module", true);
    }
}
