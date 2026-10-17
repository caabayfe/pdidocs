function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === "") return;

    if (newValue === "portal_page") {
        g_form.setValue("processor", "");
        g_form.setDisplay("portal_page", true);
        g_form.setMandatory("processor", false);
        g_form.setDisplay("processor", false);
    } else {
        g_form.setValue("portal_page", "");
        g_form.setDisplay("processor", true);
        g_form.setMandatory("portal_page", false);
        g_form.setDisplay("portal_page", false);
    }
}
