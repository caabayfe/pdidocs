(function executeRule(current, previous /*null when async*/) {
	var current_account_id = current.getValue("account_id").trim();
	current.setValue("account_id",current_account_id );
	var validationMessage = new ServiceAccountIdValidator().validateAccountId(current_account_id, current.datacenter_type);
	if (validationMessage != "success") {
		current.setAbortAction(true);
		gs.addErrorMessage(validationMessage);
	}
})(current, previous);
