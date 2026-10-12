function onLoad() {
	var listType = g_form.getValue('type');
	if(g_form.isNewRecord()) {
		if(g_form.getValue('advanced_condition') == 'true') return;
		if(listType == 'internal') {
			g_form.setValue('table', 'sys_user');
			g_form.setValue('user_field', 'sys_id');
		}
	}
}
