function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if(isLoading || newValue == ''){
		return;
	}

    if (g_form.getValue("field").includes(".")) {
        g_form.showFieldMsg("field", getMessage("The dot.walk functionality in activity definitions retrieves the current value of the dot.walk field. If you select a field that changed after the scope of your project, the accuracy of the process graph may be compromised."));
    } else {
        g_form.hideFieldMsg("field");
    }

}
