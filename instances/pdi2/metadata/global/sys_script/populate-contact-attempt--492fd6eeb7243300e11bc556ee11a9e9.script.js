(function executeRule(current, previous /*null when async*/) {

	if (!current.isNewRecord())
		return;

	var id = (current.type == 'rota') ? current.cmn_rota + '' : current.cmn_rota_escalation_set + '';
	var maxContactAttempt = new OCEscDesignerContactPrefUtilAjax().getHighestOrderContactAttempt(current.type, id);
	if (maxContactAttempt == -1)
		return '';
	
	current.setValue('contact_attempt', maxContactAttempt + 1);

})(current, previous);
