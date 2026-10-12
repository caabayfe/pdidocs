function onCondition() {
    g_form.setValue('job_config', 'jobs_per_node');
    g_form.setValue('job_config_value', '1');
    g_form.setReadOnly('job_config', false);
    g_form.setReadOnly('job_config_value', false);
}
