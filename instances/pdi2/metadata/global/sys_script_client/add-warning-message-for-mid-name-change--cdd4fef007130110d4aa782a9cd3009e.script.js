function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (newValue != oldValue) {
        g_form.addInfoMessage("Warning: The MID Server name has been changed. Please manually restart the MID Server.");
    }
}
