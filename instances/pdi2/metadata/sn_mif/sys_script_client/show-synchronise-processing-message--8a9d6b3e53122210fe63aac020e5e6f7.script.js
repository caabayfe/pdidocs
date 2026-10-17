function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    g_form.hideFieldMsg('processing_framework', true);
    if (g_form.getValue('processing_framework') == 'processor')
        g_form.showFieldMsg('processing_framework', getMessage('Process this message synchronously as specified in processor configuration'), 'info');


}
