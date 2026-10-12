function onLoad() {
	if(g_form.isNewRecord() && g_form.getValue('workflow_state') !== 'draft'){
		g_form.setValue('workflow_state', 'draft', getMessage('Draft'));
	}
}
