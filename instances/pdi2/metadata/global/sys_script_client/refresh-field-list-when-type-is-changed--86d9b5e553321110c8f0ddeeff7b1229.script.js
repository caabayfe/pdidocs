function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }
    refreshFieldListPerType();
	g_form.setValue("sub_type", "SINGLE");
}
