function onLoad() {
	var DESKTOP = '0';
	var ui_type = g_form.getValue('ui_type');

	if(ui_type !== DESKTOP) {
		g_form.setValue('global', false);
		g_form.setVisible('global', false);
	} else {
		g_form.setVisible('global', true);
	}
}
