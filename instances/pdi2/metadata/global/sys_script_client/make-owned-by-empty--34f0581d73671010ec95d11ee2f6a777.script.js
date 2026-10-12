function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (newValue === '' || oldValue != newValue)
        g_form.setValue("owned_by", "");

}
