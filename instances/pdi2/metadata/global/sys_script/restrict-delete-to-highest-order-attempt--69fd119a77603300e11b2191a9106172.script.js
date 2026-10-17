(function executeRule(current, previous /*null when async*/) {

	var ref = (current.type == 'rota') ? current.cmn_rota : current.cmn_rota_escalation_set;
	if ((ref + '') && ref.getRefRecord().isValidRecord()) {
		var maxContactAttempt = new OCEscDesignerContactPrefUtilAjax().getHighestOrderContactAttempt(current.type, ref + '');
		if (maxContactAttempt != current.contact_attempt && !current.contact_attempt.nil()) {
			gs.addErrorMessage(gs.getMessage('Deletion of contact preference only with highest order is allowed to preserve attempt sequence.'));
			current.setAbortAction(true);
		}
	}

})(current, previous);
