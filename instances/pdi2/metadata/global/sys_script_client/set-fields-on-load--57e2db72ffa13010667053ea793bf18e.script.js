function onLoad() {
	if (g_form.isNewRecord()) {
		g_form.setValue('ui_template', '0f3d316cff313010667053ea793bf150');
	} else {
		g_form.setReadOnly('ui_template', true);
		g_form.setReadOnly('experience_type', true);
	}
}
