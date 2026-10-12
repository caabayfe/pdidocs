function onCondition() {
    if (g_form.isNewRecord()) {
        g_form.setValue('provider', '44af4464431212108da9a574a9b8f2f5');
        g_form.setReadOnly('automatic_processing', false);
    }
    g_form.setDisplay('job_config', g_form.getBooleanValue('automatic_processing') == true);
    g_form.setDisplay('processing_order', g_form.getBooleanValue('automatic_processing') == true);
}
