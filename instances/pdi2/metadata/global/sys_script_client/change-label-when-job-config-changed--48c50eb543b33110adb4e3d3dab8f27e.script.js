function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {

        // UI Policy would take care for flow_engine queues
        if (g_scratchpad.provider == 'NowMQ Provider')
            return;
        if (oldValue == 'jobs_per_node')
            g_form.setLabelOf('job_config_value', getMessage('Scale factor'));
        else
            g_form.setLabelOf('job_config_value', getMessage('Number of jobs'));
        return;
    }

    if (newValue == 'jobs_per_node')
        g_form.setLabelOf('job_config_value', getMessage('Scale factor'));
    else
        g_form.setLabelOf('job_config_value', getMessage('Number of jobs'));
}
