function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }
    if (newValue === '')
        g_form.setValue('sort_by', 'sys_created_on');
}
