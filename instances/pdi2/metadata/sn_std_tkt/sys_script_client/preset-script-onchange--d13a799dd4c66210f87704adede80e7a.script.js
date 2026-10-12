function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
	if (newValue == false) 
		return;

    var script = "(function(){\r\n // Add script here\r\n \r\n })();";

    var value = g_form.getValue("applicability_script");
    if (!value) {
        g_form.setValue("applicability_script", script);
    }
}
