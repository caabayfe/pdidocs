function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	
    if (isLoading || newValue === '') {
        g_form.hideFieldMsg("duration");
        return;
    }
	
    if ( newValue <= 0) {
        g_form.showFieldMsg("duration", getMessage("Duration has to be a positive number."));
    } else {
        g_form.hideFieldMsg("duration");
    }
}
