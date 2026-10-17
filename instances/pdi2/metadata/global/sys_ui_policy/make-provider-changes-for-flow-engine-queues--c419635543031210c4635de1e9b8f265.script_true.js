function onCondition() {
    if (g_form.isNewRecord()) {
        g_form.setValue('provider', '3ccf4464431212108da9a574a9b8f2fb');
        g_form.setValue('processing_order', 'parallel');
        g_form.setValue('job_config', 'jobs_per_node');
    }
    g_form.setDisplay('processing_order', false);
    g_form.setDisplay('job_config', false);
    g_form.setLabelOf('job_config_value', 'Jobs Per Node');
    g_form.setReadOnly('automatic_processing', g_form.getBooleanValue('automatic_processing'));
}
