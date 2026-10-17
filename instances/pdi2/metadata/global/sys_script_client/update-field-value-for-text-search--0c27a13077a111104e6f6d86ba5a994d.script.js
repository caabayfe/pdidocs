function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var predicate = g_form.getValue("predicate");
    if (predicate == 'STARTS_WITH' || predicate == "ENDS_WITH" || predicate == "LIKE" || predicate == "NOT_LIKE" ) {
		g_form.setValue("field_value", newValue);
	}
}
