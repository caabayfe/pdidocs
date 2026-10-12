function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    //Type appropriate comment here, and begin script below
    if (newValue)
		g_form.showFieldMsg('path', getMessage("An entity that has a specified Table is a target entity. Target entities require unique Paths which usually is the specified Table's name. An import entity does not require the 'Table' field to be filled in."), 'info');
}
