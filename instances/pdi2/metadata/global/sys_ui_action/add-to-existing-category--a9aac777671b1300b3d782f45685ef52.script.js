function openDialogFromBankAddMetric() {
	var qb_dialog = new GlideModal('asmt_question_bank_form');
	qb_dialog.setTitle(getMessage('Add to existing Category'));
	qb_dialog.setPreference('sysparm_record_id', g_form.getUniqueValue());
	if (g_user.hasRole('survey_creator') && !g_user.hasRole("assessment_admin"))
		qb_dialog.setPreference('sysparm_query', 'metric_type.evaluation_method=' + g_scratchpad.evaluation_method + '^metric_type.survey_ownersLIKE' + g_user.userID);
	else
		qb_dialog.setPreference('sysparm_query', 'metric_type.evaluation_method=' + g_scratchpad.evaluation_method);
	qb_dialog.setPreference('sysparm_action', 'from_bank_add_metric');
	qb_dialog.render();
}
