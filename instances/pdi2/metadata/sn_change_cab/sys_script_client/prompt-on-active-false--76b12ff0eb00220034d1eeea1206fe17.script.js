function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
	
	if (newValue == "false") {
		if (!confirm(getMessage("Setting the CAB Definition to inactive will delete future meeting occurrences. Do you wish to continue?")))
			g_form.setValue("active",true);
	}
}
