function onLoad() {
	if(g_form.isNewRecord()){
		g_form.setVisible('wait_time', false);
		g_form.setVisible('duration', false);
	}
}
