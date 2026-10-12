(function executeRule(current, previous /*null when async*/) {
	//it should be an active record and not a default record in order to continue
	var emailAccounts = current.getValue('email_accounts').split(',');
	for (var i = 0; i < emailAccounts.length; i++) {
		var emailAccountGr = new GlideRecord('sys_email_account');
		if (emailAccountGr.get(emailAccounts[i]))
			if (emailAccountGr.getValue('type').toLowerCase() == 'smtp') {
				gs.addErrorMessage(gs.getMessage("Email Accounts of type '{0}' cannot be selected", [emailAccountGr.getValue('type')]));
				current.setAbortAction(true);
			}
	}
})(current, previous);
