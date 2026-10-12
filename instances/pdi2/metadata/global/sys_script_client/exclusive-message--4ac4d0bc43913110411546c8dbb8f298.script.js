function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue == '')
        g_form.setValue('exclusive', 'false');

    // Only show the info message when job criteria is not empty or changes from the old value and exclusions exist and exclusive is not false
    if (oldValue == '' || oldValue == null || newValue == '' || newValue == null || oldValue != newValue) {
        if (g_scratchpad.job_criteria_exclusions.length != 0) {
            if (g_form.getValue("schedulers") !== "specified" && g_form.getValue('exclusive') == 'false') {
                g_form.showFieldMsg('job_criteria', new GwtMessage().getMessage("Other nodes are set to exclusively run jobs with the following criteria: {0}", g_scratchpad.job_criteria_exclusions.join(", ")), 'info');
            }
        }
    }
}
