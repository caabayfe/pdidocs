function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (newValue === 'run_once') {
        g_form.setValue('trigger_fields', '');
    }

}
