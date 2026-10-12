function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == "")
		return;
	var srcType = g_form.getValue('source_type');
	if (srcType == 'sys_hub_action_type_definition')
		g_form.setDisplay('report_all_iterations',false);
	else
		g_form.setDisplay('report_all_iterations',true);
}
