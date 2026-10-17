function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }

    // Update User Interval Time should be a positive value.
	// Reset to default value, if the value is a negative number.
    var intervalTime = parseInt(newValue);
    if (newValue === '' || intervalTime < 1) {
        g_form.addErrorMessage(getMessage('Update User Interval Time should be greater than 0, resetting to default 3600 seconds.'));
        g_form.setValue('update_time_interval', 3600);
    }

}
