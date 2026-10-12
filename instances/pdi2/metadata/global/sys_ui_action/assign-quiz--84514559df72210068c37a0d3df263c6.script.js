function onDemandAssignAssessment() {
	var gDialog = new GlideDialogWindow("dialog_asr_user");
    gDialog.setPreference('table', 'select_user_quiz');
    gDialog.setTitle(new GwtMessage().getMessage('Select Assessor'));
	gDialog.setPreference('sysparm_sys_id', g_form.getUniqueValue());
    gDialog.render();
}
