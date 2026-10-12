function onLoad() {
	if (!g_form.isNewRecord()) {
		return;
	}
	if(g_form.getValue('is_root_content') === 'true' ) {
		g_form.setValue('children_layout', '0');
	} else {
		g_form.setValue('children_layout', '1');
	}
}
