function onCondition() {
    var fieldName = g_form.removeCurrentPrefix('retry_strategy');
	if(g_form.getValue(fieldName) == 'retry_after') {
		g_form.setValue(fieldName, "fixed_time_interval");
	}
    g_form.removeOption('retry_strategy', 'retry_after');
}
