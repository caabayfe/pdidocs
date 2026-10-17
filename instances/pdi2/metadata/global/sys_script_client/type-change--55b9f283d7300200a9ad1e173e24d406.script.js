function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '')
		return;

	if (typeof g_changed_class != "undefined") {
		delete g_changed_class;
		return;
	}

	var b = confirm("Changing Rectangle type will discard values for fields the new type doesn't have. Save with new value?");
	if (b)
		g_form.save();
	else {
		g_changed_class = true;
		g_form.setValue("sys_class_name", oldValue);
	}
}
