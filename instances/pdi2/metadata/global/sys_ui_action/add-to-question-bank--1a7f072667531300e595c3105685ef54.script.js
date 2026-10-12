function addMetricToBank() {
	var questionBankDialog = new GlideModal('asmt_question_bank_form');
	questionBankDialog.setTitle(getMessage('Add to Question Bank'));
	questionBankDialog.setPreference('sysparm_record_id', g_form.getUniqueValue());
	questionBankDialog.setPreference('sysparm_query', 'qb_evaluation_method=' + g_scratchpad.evaluation_method);
	questionBankDialog.setPreference('sysparm_action', 'add_metric_to_bank');
	questionBankDialog.render();
}
