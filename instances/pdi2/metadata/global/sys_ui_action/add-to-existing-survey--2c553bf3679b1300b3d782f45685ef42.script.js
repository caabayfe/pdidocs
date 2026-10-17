function openDialogFromBankAddSurveyCategory() {
	var qb_dialog = new GlideModal('asmt_question_bank_form');
	qb_dialog.setTitle(getMessage('Add to existing Survey'));
	qb_dialog.setPreference('sysparm_record_id', g_form.getUniqueValue());
	if (g_user.hasRole('survey_creator') && !g_user.hasRole("survey_admin"))
		qb_dialog.setPreference('sysparm_query', 'evaluation_method=survey^survey_ownersLIKE' + g_user.userID);
	else
		qb_dialog.setPreference('sysparm_query', 'evaluation_method=survey');
	qb_dialog.setPreference('sysparm_action', 'from_bank_add_category');
	qb_dialog.render();
}
