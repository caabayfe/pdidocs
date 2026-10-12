function onDemandAssignAssessment() {
	var gDialog = new GlideDialogWindow("dialog_asr_user");
    gDialog.setPreference('table', 'select_user_assessment');
    gDialog.setTitle(new GwtMessage().getMessage('Select Assessor'));
	gDialog.setPreference('sysparm_sys_id', g_form.getUniqueValue());
	gDialog.setPreference('sysparm_type_id', g_form.getValue('metric_type'));
	gDialog.setPreference('sysparm_source_id', g_form.getValue('source_id'));
						  
    gDialog.render();
}
