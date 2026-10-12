function onChange(control, oldValue, newValue, isLoading) {
	if(isLoading)
		return;
	if (!newValue) {
        g_form.setMandatory("training_language_dummy", true);
		    g_form.setValue("is_training_language_empty", true);
    } else {
        g_form.setMandatory("training_language_dummy", false);
		    g_form.setValue("is_training_language_empty", false);
    }
}
