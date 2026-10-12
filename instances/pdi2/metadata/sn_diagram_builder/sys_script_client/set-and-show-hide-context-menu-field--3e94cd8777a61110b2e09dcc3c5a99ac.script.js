function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (newValue === "true") {
        g_form.setDisplay("enable_port_context_menu", true);
        g_form.setValue("enable_port_context_menu", true);
    } else {
        g_form.setDisplay("enable_port_context_menu", false);
        g_form.setValue("enable_port_context_menu", false);
    }
}
