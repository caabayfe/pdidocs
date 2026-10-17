function onLoad() {
	if(g_form.getValue('upgrade_type') == 'Plugin') {
		g_form.showFieldMsg('duration', getMessage('Load Duration Summing Annotation'), 'info');
	} 
}
