function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (g_form.getValue("subobject"))
        g_form.setReadOnly("subobject", true);
}
