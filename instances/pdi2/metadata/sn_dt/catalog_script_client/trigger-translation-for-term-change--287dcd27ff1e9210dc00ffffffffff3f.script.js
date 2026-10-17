function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || newValue == '') {
        return;
    }

    if (newValue != oldValue) {
        g_form.setValue('inputs_changed', true);
    }
}
