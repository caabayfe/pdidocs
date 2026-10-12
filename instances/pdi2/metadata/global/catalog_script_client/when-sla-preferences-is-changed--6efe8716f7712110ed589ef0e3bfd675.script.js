function onChange(control, oldValue, newValue, isLoading) {
	if (isLoading) {
		return;
	}
	if (newValue) {
		var configName = g_form.getValue('target_table_name');
		var isHRConfig = configName.includes("sn_hr_core_case");
		var slaPref = JSON.parse(newValue);
		slaPref = slaPref['sla'];
		g_form.setVisible('reminders_sla', slaPref);
		g_form.setVisible('task_sla', !slaPref && !isHRConfig);
	}
}
