function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (oldValue == "false" && newValue != "true"){
        var msg = getMessage("This breakdown source was automatically disabled because the number of elements exceeds the maximum allowed as defined in the Properties");
        g_form.showFieldMsg("active", msg, "error", true);
	}
}
