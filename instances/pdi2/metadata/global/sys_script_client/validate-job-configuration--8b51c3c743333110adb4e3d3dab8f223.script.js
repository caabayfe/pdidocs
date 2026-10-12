function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '')
        return;
    var jobCount = g_form.getIntValue('job_config_value');
    if (jobCount <= 0) {
        g_form.addErrorMessage(getMessage('The job configuration is invalid, the value must be greater than zero, reverting it to the default value.'));
        g_form.setValue('job_config_value', '1');
    }
}
