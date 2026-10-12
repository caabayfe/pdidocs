function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var target_table_initial = g_form.getValue('target_table');

	if (!isLoading) {
		// Always perform these when user is changing the dropdown
		g_form.clearValue('target_id');
		g_form.clearValue('target_table');
		g_form.setValue('run_once', 'false');
	}	

	// Always clear and rebuild target_table choices
	g_form.clearOptions('target_table');
    if (newValue === 'data') {
        g_form.addOption('target_table', 'sys_ux_data_broker', 'Data Brokers');
        g_form.addOption('target_table', 'sys_ux_controller', 'Controllers');
    } else if (newValue === 'composition') {
        g_form.addOption('target_table', 'sys_ux_macroponent', 'Macroponents');
    } 

	// Since we cleared the list and rebuilt it, we need to set the correct 
	// target_table value for an existing record
	if (isLoading && newValue !== '') {
		g_form.setValue('target_table', target_table_initial);
	}
	
	// 'Run Once' should force to true if there's no target type
	if (newValue === '') {
		g_form.setValue('run_once', 'true');
	}


}
