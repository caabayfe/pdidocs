function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue == '' && g_form.getValue('cmdb_ci_class') != 'cmdb_ci_service_discovered') {
		g_form.setReadOnly('cmdb_ci_class', false);
		g_form.setValue('allow_pre_allocation', 'false');
		g_form.setReadOnly('allow_pre_allocation', true);
		g_form.setValue('allow_as_master', 'false');
		g_form.setReadOnly('allow_as_master', true);
		g_form.setValue('allow_in_bundle', 'false');
		g_form.setReadOnly('allow_in_bundle', true);
	} else if (newValue == 'alm_consumable' || newValue == 'alm_license') {
		g_form.setValue('cmdb_ci_class','');
		g_form.setReadOnly('cmdb_ci_class', true);
		g_form.setValue('allow_pre_allocation', 'false');
		g_form.setReadOnly('allow_pre_allocation', true);
		g_form.setValue('allow_as_master', 'false');
		g_form.setReadOnly('allow_as_master', true);
		g_form.setReadOnly('allow_in_bundle', false);
	} else {
		g_form.setReadOnly('cmdb_ci_class', false);
		g_form.setReadOnly('allow_pre_allocation', false);
		g_form.setReadOnly('allow_as_master', false);
		g_form.setReadOnly('allow_in_bundle', false);
	}
}
