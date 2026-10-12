function onChange(control, oldValue, newValue, isLoading, isTemplate) {

    g_form.setReadOnly('elements_filter', newValue === '');
    if ((newValue === '') || (oldValue !== newValue)) {
        g_form.setValue('elements_filter', '');
    } else
        g_form.setValue('elements_filter', g_form.getValue('elements_filter'));
}
