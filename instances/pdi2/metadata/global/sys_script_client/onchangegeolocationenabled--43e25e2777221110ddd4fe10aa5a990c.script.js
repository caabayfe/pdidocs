function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '')
        return;

    if (newValue === 'true')
        g_form.setValue('location_tracking_options', 'manual');

}
