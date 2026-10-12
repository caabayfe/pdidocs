function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue + "" === "true")
        g_form.addWarningMessage(getMessage("This template does not support the template bar feature. Please do not set this field to true."));
    else
        g_form.clearMessages();
}
